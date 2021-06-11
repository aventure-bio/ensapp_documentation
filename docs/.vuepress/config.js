module.exports = {
  title: 'Documentation Aventure Bio',
  description: 'Aventure Bio documentation',
  plugins: ['@vuepress/medium-zoom'],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'ENSAPP', link: '/ensapp/' },
    ],
    sidebar: {
      '/ensapp/': [
        '',
        'Historique',
        'Ajouter un shop',
        'Installation'
      ]
    }
  }
}
