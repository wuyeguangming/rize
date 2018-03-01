import puppeteer from 'puppeteer'
import Infrastructure from './infrastructure'

function serializeArg (arg) {
  return arg === undefined ? 'undefined' : JSON.stringify(arg)
}

function serializeFunc (func: Function, ...rest) {
  return `(${func})(${rest.map(serializeArg).join(',')})`
}

export default class Page extends Infrastructure {
  goto (url: string) {
    this.push(async () => {
      await this.page.goto(url)
    })

    return this
  }

  closePage () {
    this.push(async () => {
      await this.page.close()
    })

    return this
  }

  forward (options?: puppeteer.NavigationOptions) {
    this.push(async () => {
      await this.page.goForward(options)
    })

    return this
  }

  back (options?: puppeteer.NavigationOptions) {
    this.push(async () => {
      await this.page.goBack(options)
    })

    return this
  }

  refresh (options?: puppeteer.NavigationOptions) {
    this.push(async () => {
      await this.page.reload(options)
    })

    return this
  }

  evaluate (fn: Function | string, ...args) {
    const stringified = typeof fn === 'string' ? fn : serializeFunc(fn, ...args)

    this.push(async () => await this.page.evaluate(stringified))

    return this
  }

  evaluateWithReturn <T = any> (
    fn: ((...args) => T) | string,
    ...args
  ) {
    const stringified = typeof fn === 'string' ? fn : serializeFunc(fn, ...args)

    return new Promise<T>(resolve => {
      this.push(async () => {
        const returnValue: T = await this.page.evaluate(stringified)
        resolve(returnValue)
      })
    })
  }

  withUserAgent (userAgent: string) {
    this.push(async () => {
      await this.page.setUserAgent(userAgent)
    })

    return this
  }

  saveScreenshot (path: string, options?: puppeteer.ScreenshotOptions) {
    this.push(async () => {
      await this.page.screenshot({ ...options, path })
    })

    return this
  }

  savePDF (path: string, options?: puppeteer.PDFOptions) {
    this.push(async () => {
      await this.page.pdf({ ...options, path })
    })

    return this
  }

  waitForNavigation (timeout?: number) {
    this.push(async () => await this.page.waitForNavigation({ timeout }))

    return this
  }

  waitForElement (selector: string, timeout?: number) {
    this.push(async () => await this.page.waitForSelector(
      selector,
      { timeout }
    ))

    return this
  }

  waitForEvaluation (fn: string | Function, timeout?: number, ...args) {
    const stringified = typeof fn === 'string' ? fn : serializeFunc(fn, ...args)

    this.push(
      async () => await this.page.waitForFunction(stringified, { timeout })
    )

    return this
  }

  withAuth (username: string, password: string) {
    this.push(async () => await this.page.authenticate({ username, password }))

    return this
  }
}