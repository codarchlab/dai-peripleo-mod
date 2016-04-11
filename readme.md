# DAI-SOLR-Playground

## Setting up solr

* Download and unzip SOLR.
* You will need to create a new SOLR 'core' (we're going to name it 'peripleo'). Before you can do
  this, copy the contents of the /solr/peripleo folder into a new folder inside your SOLR
  installation: `{your-solr-dir}/server/solr/peripleo`.
* Our peripleo core will use spatial indexing. Therefore we must manually add the Java Topology
  Suite library dependency to our SOLR installation (sigh). Copy the file `solr/jts-1.13.jar` to
  the folder `{your-solr-dir}/server/solr-webapp/webapps/WEB-INF/lib`.
* Now start SOLR by typing `bin/solr start` and go to the admin interface at
  [http://localhost:8983](http://localhost:8983). (Note: you can stop SOLR by typing `bin/solr stop`).
* Add the core in the 'Core' in the 'Core Admin' area.
* Your core should now be available. Test by going to
  [http://localhost:8983/solr/peripleo/select?q=*:*](http://localhost:8983/solr/peripleo/select?q=*:*),
  which should return an empty (but valid) XML response.
* Follow the instructions in `solr-config\enable-cors.md` to enable CORS. (In a production environment,
  this should be done on the front-end HTTP server rather than SOLR.)

## Dropping a SOLR Index

In case you need to drop a SOLR index, you can do this via the REST interface. Use the following
request:

```
curl http://localhost:8983/solr/peripleo/update?commit=true -d  '<delete><query>*:*</query></delete>'
```

## Indexing the sample PELAGIOS data

The `data` folder contains a small sample dataset of 2.000 object records from the
[Pelagios project](http://commons.pelagios.org). (The snippet below shows a sample data record.)
The `scripts` folder contains a Python script for loading this data into SOLR. Run the script by
going to the `scripts` folder and typing `python indexTestdata.py`.

```json
{  
   "title":"Silver Antoninianus, Cyzicus, AD 282 - AD 285. 1944.100.36391",
   "geometry":{  
      "type":"Point",
      "coordinates":[  
         27.8741,
         40.3898
      ]
   },
   "object_type":"ITEM",
   "temporal_bounds":{  
      "to":"285-01-01",
      "from":"282-01-01"
   },
   "depictions":[  
      {  
         "uri":"http://numismatics.org/collectionimages/19001949/1944/1944.100.36391.obv.width350.jpg"
      },
      {  
         "uri":"http://numismatics.org/collectionimages/19001949/1944/1944.100.36391.rev.width350.jpg"
      }
   ],
   "identifier":"8d6346ab-ee07-4f41-b16b-9f7e65c9a87b",
   "homepage":"http://numismatics.org/collection/1944.100.36391"
}
```

## Indexing iDIG data

This repository does not include iDIG data (bring your own). The scripts folder, however, contains
a script to convert iDIG's key:value format to JSON. (Work in progress.)

## Hacking on the Frontend

The frontend code is located in the `src` folder. I recommend starting an HTTP server in this
directory, otherwise you are likely to run into Cross-origin request issues as Require.js and
Less.js will attempt to load from file:// URLs.

E.g. if you are using the Python embedded server, type `python -m SimpleHTTPServer` and point
your browser to [http://localhost:8000](http://localhost:8000).
