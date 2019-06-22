+++
title = "Dynamisch Klassen erstellen!? Craziness"
date = "2019-06-22"
draft = false
pinned = false
tags = ["Ruby", "Rails", "Meta-Programming", "hitobito"]
description = "Dynamische Klassen ertellen, meine ersten Schritte in Metaprogramming"
+++
## Das Problem: Customization in hitobito

Das Open Source Mitgliederverwaltungssystem [hitobito](http://hitobito.com) ist hoch anpassbar und darum toll für Organisationen, welche ihre komplexe Organisationsstruktur mit Gruppenarten, verschiedenen Rollen und Zugriffsberechtigungen abbilden wollen. Das grosse ABER dabei ist, dass ich das nur kann, wenn ich dafür einen [Wagon](https://github.com/hitobito/hitobito/blob/master/doc/development/04_wagons.md) (eine Art Plugin) schreibe. Ohne Coden gibt es keine Anpassung... und in der [mandantenfähigen Version](https://github.com/hitobito/hitobito_tenants), haben alle Organisationen die gleiche Organisationsstruktur.

Ein Umbau oder eine Erweiterung von hitobito, welche erlaubt eigene Gruppenstrukturn zu definieren, scheint fast unmachbar. Das Gruppen / Rollenmodell ist so zentral für hitobito, dass ein Umschreiben bedeuten würde ALLES anzufassen. Eine Monsteraufgabe.

## Meta-Programming to the rescue?

Gestern kam der Gedankenblitz: Ruby ist eine hoch dynamische Sprache mit viel Meta-Programming Möglichkeiten, könnte man damit das Problem lösen?

Ich wusste bereits, dass man dynamisch Methoden und Instanzvariablen erstellen kann, meine Frage war: Kann ich auch ganze Klassen dynamisch kreieren. Und tatsächlich:

```
Object.const_set('Experimental', Class.new do
  def hello
    "world"
  end
end
```

Der Codeblock und der Klassenname können natürlich auch als Variablen definiert werden.

```
klass_name = 'Experimental'
klass_code = 'def hello() "world" end'
Object.const_set(klass_name, Class.new do
  eval klass_code
end
```

Im Fall hitobito, würde ich z. B. neue Klassen für Gruppenarten erstellen. Dafür müssen sie Teil des Moduls `Group` sein. Um die Klasse dem Modul zuzuweisen, kann ich die Klasse direkt auf dem Modul erstellen. In Ruby ist alles ein Objekt, sowohl die Object Klasse, also auch die Modul Klasse, also kann ich diese wie folgt zuweisen:

```
Group.const_set( … )
```

Das hat wunderbar geklappt, allerding ein paar Request nachdem ich die Klasse definiert hatte, verschwand sie plötzlich.

## Zu früh gefreut? Was zum Teufel ist Garbage Collection?

Eine [Diskussion](https://www.ruby-forum.com/t/dynamic-class-creation-at-runtime/201884/2) auf dem Ruby Forum hat mich schnell auf die richtige Spur geführt, wo das das Problem zu finden sein könnte: Garbage Collection.

Garbage Collection sorgt dafür dass Objekte, die nicht mehr gebraucht werden, gelöscht werden, damit das Memory nicht vollläuft. Die grosse Frage war nun "Wie sage ich Ruby, dass die neue Klasse nicht vom Garbage Collector weggeworfen wird?". Nach langer Google Suche fand ich endlich eine [Stack Overflow Antwort](https://stackoverflow.com/questions/46988545/in-ruby-can-objects-assigned-to-a-variable-in-a-class-method-be-garbage-collect/46990972#46990972), die mir weitergeholfen hat.

Garbage Collection schaut welche Objekte nicht von anderen Objekten referenziert werden. Wenn es keine Referenz zu meiner Klasse findet, dann wird diese weggeworfen. Meine dynamische Klasse befand sich also im Limbo und verschwand.

Die Lösung ist dann ganz einfach, ich muss während der Erstellung der Klasse auch schauen, dass eine "statische" Klasse irgendeine Referenz auf die neue dynamische Klasse hat, z. B. indem ich eine das in eine Instanz oder Klassenvariable speichere. Das sieht dann etwa so aus:

```
klass_name = 'Experimental'
klass_code = 'def hello() "world" end'
new_klass = Group.const_set(name, Class.new(Group) { eval klass })
@@Constants ||= [] 
@@Constants << new_klass
```

Nice! Jetzt existiert die Klasse `Group::Experimental` und bleibt auch im Memory.

## In hitobito ausprobieren

Jetzt noch ein paar hitobito spezifische Sachen: Ich will, dass der Gruppentyp als mögliche Untergruppe erscheint:

```
Group::TopLayer.children new_klass
```

Jetzt fehlt nur noch die Übersetzung fürs Label:

```
new_translation = { activerecord: { models: {"group/experimental": "Experimental"}}}
I18n.backend.store_translations(:de, new_translation)
```

Voila! Jetzt ist dieser Gruppentype überall in der Applikation verfügbar.

Eine unmögliche Aufgabe, sieht plötzlich machbar aus!
