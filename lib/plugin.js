export default function ({ app: { router }}, inject) {
  if (<%= options.skipAll %>) {
    // inject empty gtag function for disabled mode
    inject('gtag', () => {})
    return
  }

  loadScript('https://www.googletagmanager.com', '/gtag/js?id=<%= options.id %>')
  
  window.dataLayer = window.dataLayer || []

  function gtag () {
    dataLayer.push(arguments)

    if (<%= options.debug %>) {
      console.debug('gtag tracking called with following arguments:', arguments)
    }
  }

  inject('gtag', gtag)
  gtag('js', new Date())
  gtag('config', '<%= options.id %>', <%= JSON.stringify(options.config, null, 2) %>)

  if (!<%= options.disableAutoPageTrack %>) {
    router.afterEach((to) => {
      gtag('config', '<%= options.id %>', { 'page_path': to.fullPath, 'location_path': window.location.origin + to.fullPath })
    })
  }

  // additional accounts
  <% Array.isArray(options.additionalAccounts) && options.additionalAccounts.forEach((account) => { %>
  gtag('config', '<%= account.id %>', <%= JSON.stringify(account.config, null, 2) %>)
  <% }) %>
}

function loadScript (domain, path) {
  return new Promise((resolve, reject) => {
    const head = document.head || document.getElementsByTagName('head')[0]
    const script = document.createElement('script')

    script.async = true
    script.src = domain + path

    if (domain) {
      const link = document.createElement('link')

      link.href = domain
      link.rel = 'preconnect'

      head.appendChild(link)
    }

    head.appendChild(script)

    script.onload = resolve
    script.onerror = reject
  })
}
