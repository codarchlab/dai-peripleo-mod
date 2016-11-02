#!/usr/bin/env python
import sys
import json
import requests

with open(sys.argv[1]) as f:
    data = json.load(f)
    for record in data:
        response = requests.post('http://localhost:8983/solr/peripleo/update?commit=true', json=[ record ])
        print(response.text)
