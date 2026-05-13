importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "market-journal",
  projectId: "market-journal-bf3a4",
  messagingSenderId: "671675617498",
  appId: "market-journal"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png'
  })
})
Commit changes.

Dis-moi quand c'est fait, on attaque ensuite la mise à jour du index.html pour enregistrer le token de notification.


Vous av
