import json

# Special treatment for various non-string fields
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
    # elif key == 'SpatialData':
    #   return json.loads(val)
    elif key == 'SpatialUnion':
      return val.split('\\n')
    else:
      return val
  except Exception as e:
    print(e)
    print('Error converting property: ' + key + ' : ' + val)

with open('../data/west-2015.wgs84.idig.txt') as f:
  out = open('../data/west-2015.wgs84.idig.json.txt', 'w')

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
