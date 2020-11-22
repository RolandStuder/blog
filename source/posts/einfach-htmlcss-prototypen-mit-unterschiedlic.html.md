---
title: 'Einfach HTML/CSS Prototypen mit unterschiedlichen Stati bauen mit Polypage'
date: Mon, 20 Feb 2012 13:37:00 +0000
draft: false
---

Mit [Polypage](https://github.com/andykent/polypage) kann man ganz einfach Webapps mit verschiedenen Stati simulieren.

Einfach einem HTML-Element eine Klasse mit dem Prefix pp\_ zuweisen:

```
 <li class="pp_admin">Dies hier kann getoggled werden</li> 
```

Und mit einem #pp\_toggle\_class\_name triggern:

```
[Toggle Admin](#pp_toggle_admin)
```

Quick and dirty solution.