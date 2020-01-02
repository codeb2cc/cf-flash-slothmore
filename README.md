# ʕ •́؈•̀) Flash - Response Lantency Simulator

A Cloudflare Worker to simulator response lantency. Use it to test benchmark tool like `ab` or simulator API service lantency.

### 🧪 Usage

Currently only GET request is supported. There're servel params to control how the simulator works:

- `lmin`: Min lantency in ms to add to the response. Default: `10`
- `lmax`: Max lantency in ms to add to the response. Default: `20`
- `echo`: Response body if provided
- `proxy`: Valid url to fetch and return to client. There's a `whitelist` to control which hosts can be proxied. The default whitelist is `['www.google.com', 'postb.in']`. Deploy your own worker if you want to proxy to more hosts.
- `d`: Distribution method: `uniform` | `normal` | `erlang`. Default: `uniform`. For normal distribution, there're two optional params `d_mu`(mean, default to `(lmin + lmax) / 2`) and `d_sigma`(standard deviation, default to 1). For erlang distribution, `d_k`(shape, default to 1) and `d_mu`(scale, default to `(lmax - lmin) / 2`).

For example, `curl "http://flash.codeb2cc.com/?lmin=100&lmax=200"` will respone in a random delay between [100, 200)ms. `curl "http://flash.codeb2cc.com/?proxy=https%3A//www.google.com/"` will fetch 'https://www.google.com/' and return in a [10, 20)ms delay. More:

```
curl "http://flash.codeb2cc.com/?lmin=100&lmax=200&d=normal&d_sigma=0.5"

curl "http://flash.codeb2cc.com/?lmin=100&lmax=200&d=normal&d_mu=130"

curl "http://flash.codeb2cc.com/?lmin=0&lmax=100&d=erlang&d_k=2&d_mu=30"
```


### 👩 💻 Developing

You can use this project as a template to make your own Cloudflare Worker:
```
wrangler generate my-app https://github.com/codeb2cc/cf-flash-slothmore
```


### 👀 TODO

More features:

- [x] Different lantency distribution models (normal/erlang(poisson) and more)
- [ ] Support simulator params(`lmin`, `lmax`, etc) in request headers
- [ ] Cache proxy response to protect target API service
- [ ] Custom cache missing rate and ttl
- [ ] Predefine response data read from Cloudflare KV


![flash-slothmore](flash-slothmore.jpg)