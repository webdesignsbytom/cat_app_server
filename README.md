# cat_app_server

```js
const [videoPreviews, setVideoPreviews] = useState([]);

useEffect(() => {
  const fetchVideoPreviews = async () => {
    // Fetch the preview URLs in parallel
    const previewUrls = await Promise.all(
      // Create an array of 5 elements. Each element corresponds to an index from 0 to 4.
      Array.from(
        { length: 5 },
        // The second argument to Array.from is a mapping function that provides the index 'i' as the second parameter.
        (_, i) =>
          // Fetch the video preview for the current index 'i'.
          fetch(`/videos/preview/${i}`)
            // The fetch function returns a promise that resolves to a response object.
            .then(
              (response) =>
                // Extract the URL from the response object. This URL is used to set the source of the video preview.
                response.url
            )
      )
    )
    setVideoPreviews(previewUrls);
  };

  fetchVideoPreviews();
}, []);
```


get main video
videoId 3
fileSize: 2363731
range: bytes=0-
start 0
end 2363730

get main video
videoId 3
fileSize: 2363731
range: bytes=2359296-
start 2359296
end 2363730

get main video
videoId 3
fileSize: 2363731
range: bytes=131072-
start 131072
end 2363730

GET
	
scheme
	http
host
	localhost:4000
filename
	/videos/video/3
Address
	127.0.0.1:4000
Status
206
Partial Content
VersionHTTP/1.1
Transferred524.55 kB (524.29 kB size)
Referrer Policystrict-origin-when-cross-origin
Request PriorityHighest
DNS ResolutionSystem

	
Accept-Ranges
	bytes
Access-Control-Allow-Origin
	*
Connection
	keep-alive
Content-Length
	2363731
Content-Range
	bytes 0-2363730/2363731
Content-Type
	video/mp4
Date
	Thu, 18 Jul 2024 15:14:43 GMT
Keep-Alive
	timeout=5
	
Accept
	video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5
Accept-Encoding
	identity
Accept-Language
	en-US,en;q=0.5
Connection
	keep-alive
Cookie
	_ga=GA1.1.265816421.1716740005; _ga_5TSPX20DLD=GS1.1.1717612403.1.1.1717613249.0.0.0; _gid=GA1.1.146176561.1721172348
Host
	localhost:4000
Priority
	u=0
Range
	bytes=0-
Referer
	http://localhost:8100/
Sec-Fetch-Dest
	video
Sec-Fetch-Mode
	no-cors
Sec-Fetch-Site
	same-site
User-Agent
	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0



GET
	http://localhost:4000/videos/video/3
Status
206
Partial Content
VersionHTTP/1.1
Transferred4.70 kB (4.44 kB size)
Referrer Policystrict-origin-when-cross-origin
DNS ResolutionSystem

	
Accept-Ranges
	bytes
Access-Control-Allow-Origin
	*
Connection
	keep-alive
Content-Length
	4435
Content-Range
	bytes 2359296-2363730/2363731
Content-Type
	video/mp4
Date
	Thu, 18 Jul 2024 15:14:43 GMT
Keep-Alive
	timeout=5
	
Accept
	video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5
Accept-Encoding
	identity
Accept-Language
	en-US,en;q=0.5
Connection
	keep-alive
Cookie
	_ga=GA1.1.265816421.1716740005; _ga_5TSPX20DLD=GS1.1.1717612403.1.1.1717613249.0.0.0; _gid=GA1.1.146176561.1721172348
Host
	localhost:4000
Priority
	u=4
Range
	bytes=2359296-
Referer
	http://localhost:8100/
Sec-Fetch-Dest
	video
Sec-Fetch-Mode
	no-cors
Sec-Fetch-Site
	same-site
User-Agent
	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0



GET
	http://localhost:4000/videos/video/3
Status
206
Partial Content
VersionHTTP/1.1
Transferred2.23 MB (2.23 MB size)
Referrer Policystrict-origin-when-cross-origin
DNS ResolutionSystem

	
Accept-Ranges
	bytes
Access-Control-Allow-Origin
	*
Connection
	keep-alive
Content-Length
	2232659
Content-Range
	bytes 131072-2363730/2363731
Content-Type
	video/mp4
Date
	Thu, 18 Jul 2024 15:14:43 GMT
Keep-Alive
	timeout=5
	
Accept
	video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5
Accept-Encoding
	identity
Accept-Language
	en-US,en;q=0.5
Connection
	keep-alive
Cookie
	_ga=GA1.1.265816421.1716740005; _ga_5TSPX20DLD=GS1.1.1717612403.1.1.1717613249.0.0.0; _gid=GA1.1.146176561.1721172348
Host
	localhost:4000
Priority
	u=4
Range
	bytes=131072-
Referer
	http://localhost:8100/
Sec-Fetch-Dest
	video
Sec-Fetch-Mode
	no-cors
Sec-Fetch-Site
	same-site
User-Agent
	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0