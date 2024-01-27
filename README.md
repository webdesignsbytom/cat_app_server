# cat_app_server

```js
import React, { useEffect, useState } from 'react';
import VideoPlayer from '../../components/video/VideoPlayer';

function TestPage() {
  const videoUrl = 'http://localhost:4000/videos/cat-of-the-day';

  return (
    <div>
      <h1>Video Stream</h1>
      <VideoPlayer videoSrc={videoUrl} />
    </div>
  );
}

export default TestPage;
import React from 'react';

function VideoPlayer({ videoSrc }) {
  return (
    <div>
      <video width='750' height='500' controls>
        <source src={videoSrc} type='video/mp4' />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoPlayer;
```
