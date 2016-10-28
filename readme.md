# DAI-PERIPLEO SOLR Integration

A modified version of the Pelagios 'Peripleo' search UI that works on SOLR.

## Setting up SOLR

* Download and unzip SOLR.
* You will need to create a new SOLR 'core' (we're going to name it 'peripleo'). Before you can do
  this, copy the contents of the /solr/peripleo folder into a new folder inside your SOLR
  installation: `{your-solr-dir}/server/solr/peripleo`.
* Our peripleo core will use spatial indexing. Therefore we must manually add the Java Topology
  Suite library dependency to our SOLR installation (sigh). Copy the file `solr/jts-1.13.jar` to
  the folder `{your-solr-dir}/server/solr-webapp/webapps/WEB-INF/lib`.
* Now start SOLR by typing `bin/solr start` and go to the admin interface at
  [http://localhost:8983](http://localhost:8983). (Note: you can stop SOLR by typing `bin/solr stop`).
* Add the core in the 'Core Admin' area.
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

## Indexing iDIG data

This repository includes a sample iDIG dataset in the `data` folder. The `scripts` folder contains
a Python script to index this sample file into SOLR (`indexiDigJSON.py`).

## Hacking on the Frontend

The frontend code is located in the `src` folder. I recommend starting an HTTP server in this
directory, otherwise you are likely to run into Cross-origin request issues as Require.js and
Less.js will attempt to load from file:// URLs.

E.g. if you are using the Python embedded server, type `python -m SimpleHTTPServer` and point
your browser to [http://localhost:8000](http://localhost:8000).
