const BadRequest = { status: 400 }
const MethodNotAllowed = { status: 405 }

export async function handleRequest(request: Request): Promise<Response> {
  if (request.method != 'GET') {
    return new Response('', MethodNotAllowed)
  }

  let params = (new URL(request.url)).searchParams
  let latencyMax = parsePositive(params.get('lmax'), 20)
  let latencyMin = Math.min(parsePositive(params.get('lmin'), 10), latencyMax)
  let echo = params.get('echo')
  let proxy = params.get('proxy')

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
    await delay(randInt(latencyMin, latencyMax))
  }
  return response
}

function parsePositive(input: string | null, defaultVal?: number): number {
  let value = parseInt(input || 'NaN')
  if (value == NaN) {
    value = defaultVal || 0
  }
  if (value < 0) {
    value = 0
  }
  return value
}

function delay(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}