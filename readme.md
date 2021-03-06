Calculatoure
============
Calculatoure is a very slick, versatile and easy to use scientific calculator made with HTML5. Perform complex mathematical calculations including trigonometry, algebra, base conversion and bitwise operations. Works offline (as a Chrome app).

Build requirements
------------------
makejs: http://www.github.com/jussi-kalliokoski/makejs/

API manual
----------
First, build it:

```
$ makejs api
```

Then grab the calculatoure.api.(jgz or js, whichever you wish to serve, or both)
Use a script tag to include it.
Voila, you can use the api, try typing

```javascript
alert(calculatoure('2pi'))
```

into your js console to see if it works.

You can also run the unit tests: (requires NodeJS or a browser)

```shell
$ makejs api --unit-tests 
```

CLI instructions
----------------

First, build it and then install:

```shell
$ makejs cli; cd cli; sudo makejs install; cd ..
```

And then you can use

```shell
$ calculatoure
```

in the bash to start the application. ctrl+c to quit.

Changelog
---------

### 2011/07/11: v.0.9992 (1RC3)

 * Added literals for logical bitwise operations (AND, OR, XOR, NOT)

 * Updated logo.

 * Deprecated unusable parts of JS from the syntax parser.


### 2011/04/08: v.0.9991 (1RC2)

 * Some final patching up.

 * More keyboard shortcuts (try shift + directional buttons).


### 2011/04/07: v.0.999

 * Auto-Completion via TAB button.

 * Automatic parens closing feature.

 * Added curly and square bracket support as parens.

 * Introducing CLI version for Linux via NodeJS.

 * Some other big changes I can't remember.


### 2011/02/13: v.0.998

 * Option to disable reflection


### 2011/02/06: v.0.997

 * Easier to share

 * More keyboard shortcuts

 * History works nicer now.


### 2011/01/24: v.0.995

 * Readme

 * Separated UI and API

 * Calculatoure API can now be used independently.

 * Random can now also be used as a function.

 * help() recognizes rand and ans now


### v.0.994

 * Updated to the newest version of CodeExpression.

 * Fixed a bug to do with % not working.


### 2011/01/14: v. 0.993

 * Repackaged (Chrome app) to work offline!

 * NOTE (for Chrome app users): If you have installed prior to this update, you should reinstall (uninstall & install).

 * To make things faster, you should bind a hotkey for Calculatoure (a guide: http://goo.gl/MMzTk )


### 2011/01/13: v. 0.992 (Loads of cool new features!)

 * Now supports base conversions 2-16 fully (see help(base))

 * Custom variables enabled (but you still can't break anything :] )

 * ans (or answer) now returns the latest answer and ans(x) returns x:th answer, very cool for recursion.

 * Better formula memory

 * More lenient syntax, e.g. you can type 2pi equals 2*pi, 256 2 also equals 256*2!

 * Support for degrees and turns (e.g. sin(190deg) )

 * Fixed a critical bug for decimals starting with a zero


### 2011/01/04: v. 0.991 (1.0RC1, r16)

 * New design to increase productivity, functionality and eyecandy.

 * New versions of Jin and CodeExpression (MUCH faster, more reliable)

 * Lightweight code, the whole Calculatoure is now only 13.8KB. (Compare to previous ~1MB) Thus much faster, yet again.
