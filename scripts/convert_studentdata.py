#!/usr/bin/env python3
"""Convert data/studentdata.xlsx into data/students.json used by the app."""

from __future__ import annotations

import hashlib
import json
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Iterable, List, Optional

NS = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / 'data'
XLSX_PATH = DATA_DIR / 'studentdata.xlsx'
OUTPUT_PATH = DATA_DIR / 'students.json'
VALID_BLOCKS = {'HA', 'HB', 'HC', 'HD', 'HE', 'HF', 'HG', 'HH'}


def load_shared_strings(workbook: zipfile.ZipFile) -> List[str]:
  try:
    root = ET.fromstring(workbook.read('xl/sharedStrings.xml'))
  except KeyError:
    return []

  strings: List[str] = []
  for element in root.findall('main:si', NS):
    text = ''.join(text_el.text or '' for text_el in element.findall('.//main:t', NS))
    strings.append(text)
  return strings


def column_to_index(column: str) -> int:
  index = 0
  for char in column:
    if not char.isalpha():
      continue
    index = index * 26 + (ord(char.upper()) - ord('A') + 1)
  return index - 1


def read_cell(cell: ET.Element, shared_strings: List[str]) -> str:
  cell_type = cell.attrib.get('t')
  if cell_type == 's':
    value = cell.find('main:v', NS)
    if value is not None and value.text is not None:
      return shared_strings[int(value.text)]
    return ''
  if cell_type == 'inlineStr':
    text = cell.find('main:is/main:t', NS)
    return text.text if text is not None else ''
  value = cell.find('main:v', NS)
  return value.text if value is not None and value.text is not None else ''


def parse_sheet(workbook: zipfile.ZipFile, sheet_name: str, gender: str,
                shared_strings: List[str]) -> Iterable[Dict[str, str]]:
  root = ET.fromstring(workbook.read(sheet_name))
  headers: Optional[List[str]] = None
  for row in root.findall('main:sheetData/main:row', NS):
    values: Dict[int, str] = {}
    for cell in row.findall('main:c', NS):
      ref = cell.attrib.get('r', '')
      column = ''.join(char for char in ref if char.isalpha())
      if not column:
        continue
      values[column_to_index(column)] = read_cell(cell, shared_strings)
    if not values:
      continue
    max_index = max(values)
    row_values = [values.get(i, '') for i in range(max_index + 1)]
    if headers is None:
      headers = row_values
      continue
    entry = {headers[i]: row_values[i] for i in range(len(headers)) if headers[i]}
    entry['GENDER'] = gender
    yield entry


def normalize_room(room: str) -> str:
  clean = room.strip().upper()
  if not clean:
    return clean
  tokens = [token for token in clean.replace('\\', '/').split('/') if token and token != '-']
  if not tokens:
    return clean
  block, *rest = tokens
  return f"{block}-{'-'.join(rest)}" if rest else block


def extract_block(room: str) -> str:
  clean = room.strip().upper()
  return clean[:2]


def make_record_id(student_id: str, room_number: str) -> str:
  key = f'{student_id.strip()}|{room_number}'
  return hashlib.sha1(key.encode('utf-8')).hexdigest()[:20]


def nationality_to_status(value: str) -> str:
  normalized = (value or '').strip().lower()
  if not normalized:
    return 'Local'
  return 'Local' if 'malay' in normalized else 'International'


def row_to_student(row: Dict[str, str]) -> Optional[Dict[str, str]]:
  if (row.get('ROOM STATUS') or '').strip().upper() != 'CHECKED IN':
    return None
  student_id = (row.get('STUDENT ID') or '').strip()
  name = (row.get('STUDENT / RESIDENT / RESERVED') or '').strip()
  room_number_raw = (row.get('ROOM NO') or '').strip()
  if not student_id or not name or not room_number_raw:
    return None
  normalized_room = normalize_room(room_number_raw)
  block = extract_block(room_number_raw)
  if block not in VALID_BLOCKS:
    return None
  return {
      'id': make_record_id(student_id, normalized_room),
      'studentId': student_id,
      'name': name,
      'programme': (row.get('PROG') or '').strip() or 'Unknown',
      'roomNumber': normalized_room,
      'gender': row.get('GENDER', 'Male'),
      'status': nationality_to_status(row.get('NAT.') or ''),
      'block': block
  }


def main() -> int:
  if not XLSX_PATH.exists():
    print(f'Workbook not found: {XLSX_PATH}', file=sys.stderr)
    return 1

  with zipfile.ZipFile(XLSX_PATH) as workbook:
    shared_strings = load_shared_strings(workbook)
    records = []
    for sheet, gender in (('xl/worksheets/sheet1.xml', 'Male'),
                          ('xl/worksheets/sheet2.xml', 'Female')):
      for row in parse_sheet(workbook, sheet, gender, shared_strings):
        student = row_to_student(row)
        if student:
          records.append(student)

  records.sort(key=lambda item: (item['block'], item['roomNumber'], item['name']))
  OUTPUT_PATH.write_text(json.dumps(records, indent=2), encoding='utf-8')
  print(f'Wrote {len(records)} student records to {OUTPUT_PATH}')
  return 0


if __name__ == '__main__':
  raise SystemExit(main())
