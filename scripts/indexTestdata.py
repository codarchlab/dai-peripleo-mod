import json
import requests
import geojson
from shapely.geometry import shape

def copyIfExists(source, target, property):
  if property in source:
    target[property] = source[property]

def flattenList(source, target, property):
  if property in source:
    for idx, record in enumerate(source[property]):
      for key, val in record.iteritems():
        target[property + '.' + key + '.' + str(idx)] = val

with open('../data/items.json.txt') as f:
  for line in f.readlines():
    item = json.loads(line)
    converted = {
      'identifier': item['identifier'],
      'object_type': item['object_type'],
      'title': item['title']
    }

    copyIfExists(item, converted, 'description')
    copyIfExists(item, converted, 'homepage')

    flattenList(item, converted, 'depictions')

    # Convert geometry to WKT
    if 'geometry' in item:
      geo = shape(geojson.loads(json.dumps(item['geometry'])))
      converted['geometry'] = geo.wkt

    response = requests.post('http://localhost:8983/solr/peripleo/update?commit=true', json=[ converted ])
    print(response.text)
