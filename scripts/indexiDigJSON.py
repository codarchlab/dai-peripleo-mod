import json
import requests

with open('../data/sample_west_2013.json') as f:
    data = json.load(f)
    for record in data:
        response = requests.post('http://localhost:8983/solr/peripleo/update?commit=true', json=[ record ])
        print(response.text)
