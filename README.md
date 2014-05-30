node-content-filter-proxy
=======

`node-content-filter-proxy` is an HTTP-based content filter library. 

# Examples

## Basic Usage

```
$ cd examples && node basic.js
```
## Extract hyperlink: &lt;a href="..."&gt;...&lt;/a&gt;

```
$ cd examples && npm install && node extract-hmtl-a-href.js
```

# Usage

```
$ http_proxy="http://localhost:3128" wget -qO- http://www.google.com
<a href="http://www.google.com.sg/imghp?hl=en&tab=wi">Images<a/>
<a href="http://maps.google.com.sg/maps?hl=en&tab=wl">Maps<a/>
<a href="https://play.google.com/?hl=en&tab=w8">Play<a/>
<a href="http://www.youtube.com/?gl=SG&tab=w1">YouTube<a/>
<a href="http://news.google.com.sg/nwshp?hl=en&tab=wn">News<a/>
<a href="https://mail.google.com/mail/?tab=wm">Gmail<a/>
<a href="https://drive.google.com/?tab=wo">Drive<a/>
<a href="http://www.google.com.sg/intl/en/options/">More ?<a/>
<a href="http://www.google.com.sg/history/optout?hl=en">Web History<a/>
<a href="/preferences?hl=en">Settings<a/>
...
<a href="/intl/en/about.html">About Google<a/>
<a href="/intl/en/policies/">Privacy & Terms<a/>
```
