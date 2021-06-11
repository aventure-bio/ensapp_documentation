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
        'Historique',
        'Ajouter un magasin',
        'Installation',
        'database',
        'User_stories'
      ]
    }
  }
}
