##Домашняя работа №3

###Express

Express &mdash; фреймфорк для написания веб-приложений на платформе Node.js. В основе работы Express лежит паттерн `middleware`.

###Middleware

Middleware &mdash; функция, имеющая доступ к [объекту запроса](http://expressjs.com/en/4x/api.html#req) `req`, [объекту ответа](http://expressjs.com/en/4x/api.html#res) `res` и следующей функции `next` в цикле обработки запроса/ответа в приложении.

Middleware-функции могут выполнять такие задачи:

- Выполнять любой код
- Изменять объекты запроса `req` и ответа `res`
- Заканчивать цикл обработки запроса/ответа
- Вызывать следующую middleware-функцию в стэке


###Задание

#### Условия
1. Нельзя исользовать дополнительные внешние модули, например `cookie-parser`
1. Для успешно сдачи нужно чтобы проходили базовые тесты, проверять `npm test`

####Реализуйте набор middleware-функций

- _Middleware авторизации_. 
Она должна проверять значение авторизационной куки (`authorize`), 
в случае если оно неизвестно или отсутствует &mdash; отдавать 403 ошибку. 
Если значение известно &mdash; передавать следующую функцию в стэке middleware. 
Например, если пришли кука `"authorize": "random authorize string"`, то считаем, что пользователь авторизован, а
если кука вообще не пришла или пришла как пустая строка, то нет

- _Middleware логирования времени исполнения_. 
Замеряет время работы в миллисекундах (до тысячных) всех остальных middleware в стэке, 
логирует это время в консоль, и устанавливает хедер со временем работы `X-Time`.
Например, по результатам работы, сервер должен ответить заголовком `X-Time: 112.432`

- _Middleware логирования запросов_. 
Логирует в консоль все урлы и методы вызовов к веб-приложению, устанавливает в ответ хедер `X-Request-Url`
Например, если был вызван метод `GET` для урла `/apiUrl`, то должен установиться заголовок `X-Request-Url: "GET /apiUrl"`

- _Middleware обработки ошибок_. 
Обрабатывает все ошибки, произошедшие в предыдущих middleware, так же обрабатывает все некорректные запросы к серверу,
выводит их в консоль `console.error` и возвращает пустой ответ с хедером `X-Request-Error: "error message"` 
Например, если был вызван трансформирующий поток с строкой на русском и английском языке, то вернуть заголовок с ошибкой:
`X-Request-Error: "Multiple language"` или если некорректный вызов API, например `GET /incorrect` (без `/v1/`), то
возвращать ошибку `X-Request-Error: "Unknown request"`

####Реализуйте трансформирующий поток

Реализуйте два трансформирующих потока которые принимают строку и производят транслитерацию:
 
1. Ожидает строку на русском, делает _прямую_ (из кириллических символов в латинские) трансформацию
2. Ожидает строку на английском, делает _обратную_ (из латинских символов в кириллические) трансформацию

Правила транслитерации:

| Кириллица | Латиница |
| ---------:|:--------:|
| А         | A        |
| Б         | B        |
| В         | V        |
| Г         | G        |
| Д         | D        |
| Е         | E        |
| Ё         | Jo       |
| Ж         | Zh       |
| З         | Z        |
| И         | I        |
| Й         | J        |
| К         | K        |
| Л         | L        |
| М         | M        |
| Н         | N        |
| О         | O        |
| П         | P        |
| Р         | R        |
| С         | S        |
| Т         | T        |
| У         | U        |
| Ф         | F        |
| Х         | H        |
| Ц         | C        |
| Ч         | Ch       |
| Ш         | Sh       |
| Щ         | Shh      |
| Ъ         | #        |
| Ы         | Y        |
| Ь         | '        |
| Э         | Je       |
| Ю         | Ju       |
| Я         | Ja       |

Считаем что заглавные и прописные буквы кодируются одинаково, вам в помощь [translit.ru](http://translit.net/)

####Реализуйте веб-приложение

Реализуйте с помощью Express веб-приложение которое предоставляет доступ к файловой системе. 
Приложение должно использовать все middleware из предыдущего задания и на лету производить транслитерацию. 
При старте приложение должно монтироваться к какой-либо директории на локальной файловой системе.

Если полученный URL ссылается на директорию, нужно отдать список файлов в директории. 
URL указывается относительно текущей дериктории

```
> GET /v1/files/ HTTP/1.1
> Host: example.com
> Cookie: <auth_cookie>
>
< HTTP/1.1 200 OK
< Content-Type: application/json;charset=UTF-8
< Content-Length: 36
< Last-Modified: Fri, 23 Sep 2016 12:56:44 GMT
<
< {"content": [".", "..", "file.txt"]}
```

Если полученный URL ссылается на файл, нужно отдать JSON с транслитерированным содержимым файла. 
В случае, если используются кириллические символы, нужно провести прямую транслитерацию; 
в случае если латинские &mdash; обратную. В иных случаях нужно ответить ошибкой.

```
> GET /v1/files/file.txt HTTP/1.1
> Host: example.com
> Cookie: <auth_cookie>
>
< HTTP/1.1 200 OK
< Content-Type: application/json;charset=UTF-8
< Content-Length: 21
< Last-Modified: Fri, 23 Sep 2016 12:56:44 GMT
<
< {"content": "Privet"}
```

####Задания со звездочкой*

- Расширьте приложение возможностью монтироваться не только к локальной файловой системе, 
но и к удаленным FTP- и WebDAV-серверам. Напишите в комментарии к коду небольшую инструкцию как переключаться, 
как пользоваться и как проверить что возвращаются нужные файлы. Если нужно будет светить логин-пароль, то
можете завести фейковый аккаунт
- Реализуйте трансформирующий поток, осуществляющий преобразование бинарных данных в Base64.
Напишите небольшую инструкцию в коде как запустить данный трансформирующий поток вместо транслитерационного.

### Дополнительно
Чтобы успешно сделать задание:

- нужно сделать не менее 10 коммитов в пулреквесте
- тесты будут дополняться, сейчас только базовые тесты, не забывайте обновляться от исходного репозитория.
Если вы написали код верно, то он будет работать, при изменении тестов, т.к. тесты тестируют функциональность,
описанную в задании, они нужны только для вспомогательной цели.
