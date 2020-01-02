const BadRequest = { status: 400 }
const MethodNotAllowed = { status: 405 }

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method != 'GET') {
    return new Response('', MethodNotAllowed)
  }

  let params = (new URL(request.url)).searchParams
  let latencyMax = parsePositiveInt(params.get('lmax'), 20)
  let latencyMin = Math.min(parsePositiveInt(params.get('lmin'), 10), latencyMax)
  let echo = params.get('echo')
  let proxy = params.get('proxy')
  let distributionFunc = params.get('d') || 'uniform'

  const hello = `Nice...to...see you...too!`
  let response = echo != undefined ? new Response(echo) : new Response(hello)

  if (proxy != undefined) {
    try {
      let proxyUrl = new URL(proxy)
      // Should set a whitelist for security concern
      const whitelist = ['www.google.com', 'postb.in']
      if (whitelist.indexOf(proxyUrl.host) != -1) {
        response = await fetch(proxyUrl.toString())
      } else {
        throw new Error(`${proxyUrl.host} is not in proxy whitelist: ` + JSON.stringify(whitelist))
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), BadRequest)
    }
  }

  if (latencyMax != 0) {
    let lantency = 0
    try {
      switch (distributionFunc) {
        case 'uniform':
          lantency = randUniform(latencyMin, latencyMax)
          break
        case 'normal': {
          let mu = (latencyMin + latencyMax) / 2
          let sigma = 1
          if (params.get('d_mu') != undefined) {
            mu = parsePositiveInt(params.get('d_mu'), mu)
          }
          if (params.get('d_sigma') != undefined) {
            sigma = parsePositiveFloat(params.get('d_sigma'), sigma)
          }
          lantency = Math.max(Math.min(randNormal(mu, sigma), latencyMax), latencyMin)
          break
        }
        case 'erlang': {
          let k = 1 // Shape
          if (params.get('d_k') != undefined) {
            k = parsePositiveInt(params.get('d_k'), k)
          }
          let mu = (latencyMax - latencyMin) / 2  // Scale
          if (params.get('d_mu') != undefined) {
            mu = parsePositiveFloat(params.get('d_mu'), mu)
          }
          lantency = Math.min(randErlang(k, 1 / mu) + latencyMin, latencyMax)
          break;
        }
        default:
          throw new Error(`Unsupported distribution method ${distributionFunc}`)
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), BadRequest)
    }

    await delay(lantency)
  }
  return response
}

function delay(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, Math.ceil(ms)))
}

function parsePositiveInt(input: string | null, defaultVal?: number): number {
  let value = parseInt(input || 'NaN')
  if (value == NaN || value < 0) {
    value = defaultVal || 0
  }
  return value
}

function parsePositiveFloat(input: string | null, defaultVal?: number): number {
  let value = parseFloat(input || 'NaN')
  if (value == NaN || value < 0) {
    value = defaultVal || 0
  }
  return value
}

function randUniform(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

function randNormal(mu: number, sigma: number): number {
  let x, y, r
  do {
    x = Math.random() * 2 - 1
    y = Math.random() * 2 - 1
    r = x * x + y * y
  } while (!r || r > 1)
  return mu + sigma * y * Math.sqrt(-2 * Math.log(r) / r)
}

// https://en.wikipedia.org/wiki/Erlang_distribution#Generating_Erlang-distributed_random_variates
function randErlang(k: number, lambda: number): number {
  let u = 1
  for (let i = 0; i < k; i++) {
    u = u * Math.random()
  }
  return - (1 / lambda) * Math.log(u)
}