# Enabling CORS on SOLR

To enable CORS on SOLR, add the following XML snippet to `server\solr-webapp\webapp\WEB-INF\web.xml`,
right at the start of the `<web-app>` element. (Cf.
[http://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/ ](http://opensourceconnections.com/blog/2015/03/26/going-cross-origin-with-solr/))

```xml
<filter>
  <filter-name>cross-origin</filter-name>
  <filter-class>org.eclipse.jetty.servlets.CrossOriginFilter</filter-class>
  <init-param>
    <param-name>allowedOrigins</param-name>
    <param-value>*</param-value>
  </init-param>
  <init-param>
    <param-name>allowedMethods</param-name>
    <param-value>GET,POST,OPTIONS,DELETE,PUT,HEAD</param-value>
  </init-param>
  <init-param>
    <param-name>allowedHeaders</param-name>
    <param-value>origin, content-type, accept</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>cross-origin</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>
```
