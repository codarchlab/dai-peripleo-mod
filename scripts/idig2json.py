import json

'''
iDig export format is key/value along the following scheme:

Key : Value

with the following keys and value types:
Category              - String (e.g. "Sculpture")
Contents              - Multiple Strings, separated by escaped new line
Context               - String
Coverage              - String
Creator               - String
Date                  - Date, formatted like 'Jun 15, 2015'
DateEarliest          - Date, formatted like yyyy-MM-dd'T'HH:mm:ssZ
DateLatest            - Date, formatted like yyyy-MM-dd'T'HH:mm:ssZ
DateTimeZone          - String ("Europe/Athens")
DateUTC               - formatted like yyyy-MM-dd'T'HH:mm:ssZ
FormatLocked          - Int number (?)
FormatSidelined       - Int number (?)
FormatStatus          - String (?)
FormatTrashed         - Int number (?)
Identifier            - Int number (?)
IdentifierUUID        - UUID as String
Language              - String (2-char ISO code)
Material              - String (e.g. "Marble")
NotebookPage          - Int numbers, separated by escaped new line
RelationBelongsTo     - Multiple Strings, separated by escaped new line
RelationBelongsToUUID - Multiple UUIDs, separated by escaped new line
RelationIncludes      - Multipe Strings, separated by escaped new line
RelationIncludesUUID  - (?) - should be multipe UUIDs but has e.g. "2015.16.0026\n2015.16.0181"
Spatial               - String (?) (e.g. "K/8-3/5")
SpatialAltitude       - Interval formatted like "[53.39 TO 53.39]"
SpatialCRS            - String (e.g. WGS84)
SpatialCoordinates    - comma-separated lon, lat, alt (e.g. "23.724551, 37.977388, 53.39")
SpatialData           - JSON array as string ('name' property doesn't seem to appear anywhere
                        else, so maybe interesting to parse)
SpatialGeometry       - WKT geometry collection (?)
SpatialPosition       - comma-separated lon, lat
SpatialStyle          - String (e.g. "MARKER")
SpatialUnion          - WKT geometric object
Title                 - String
Type                  - String (e.g. "Artifact")
'''

# Special treatment for everything that's not a String
def convertValue(key, val):
  try:
    if key == 'Contents':
      return val.split('\\n')
    if key == 'FormatLocked' or key == 'FormatSidelined' or key == 'FormatTrashed':
      return int(val)
    elif key == 'Identifier':
      return int(val)
    elif key == 'NotebookPage':
      return map(lambda v: int(v), val.split('\\n'))
    elif key.startswith('Relation'):
      return val.split('\\n')
    elif key == 'SpatialAltitude':
      fromTo = val.split(' TO ')
      return { 'from': float(fromTo[0][1:].strip()), 'to': float(fromTo[1][:-1].strip()) }
    elif key == 'SpatialData':
      return json.loads(val)
    else:
      return val
  except Exception as e:
    print(e)
    print('Error converting property: ' + key + ' : ' + val)

with open('../data/west-2015.wgs84.idig.txt') as f:
  out = open('../data/west-2015.wgs84.idig.json', 'w')

  currentRecord = {}
  for line in f.readlines():
    if ':' in line:
      # Continue building object
      keyVal = line.split(':', 1) # Max one split
      key = keyVal[0].strip()
      val = keyVal[1].strip()
      currentRecord[key] = convertValue(key, val)
    else:
      # Object delimiter
      out.write(json.dumps(currentRecord) + '\n')
      currentRecord = {}

out.close()
