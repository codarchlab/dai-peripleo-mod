import json
import requests

with open('../data/west-2015.wgs84.idig.json.txt') as f:
  for line in f.readlines():
    item = json.loads(line)
    response = requests.post('http://localhost:8983/solr/peripleo/update?commit=true', json=[ item ])
    print(response.text)
