module.exports = {
  title: 'Documentation ENSAPP',
  description: "Documentation tech pour l'application ENSAPP",
  plugins: ['@vuepress/medium-zoom'],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'ENSAPP', link: '/ensapp/' },
    ],
    sidebar: {
      '/ensapp/': [
        '',
        'installation',
        'database',
        'api',
        'product',
        'client_order',
        'supplier_order',
        'errors'
      ]
    }
  }
}
