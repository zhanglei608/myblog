var path = require('path');
var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var config = require('config-lite');
var routes = require('./routes');
var pkg = require('./package');
var winston = require('winston');
var expressWinston = require('express-winston');

var app = express();

// ����ģ��Ŀ¼
app.set('views', path.join(__dirname, 'views'));
// ����ģ������Ϊ ejs
app.set('view engine', 'ejs');

// ���þ�̬�ļ�Ŀ¼
app.use(express.static(path.join(__dirname, 'public')));
// session �м��
app.use(session({
  name: config.session.key,// ���� cookie �б��� session id ���ֶ�����
  secret: config.session.secret,// ͨ������ secret ������ hash ֵ������ cookie �У�ʹ������ signedCookie ���۸�
  cookie: {
    maxAge: config.session.maxAge// ����ʱ�䣬���ں� cookie �е� session id �Զ�ɾ��
  },
  store: new MongoStore({// �� session �洢�� mongodb
    url: config.mongodb// mongodb ��ַ
  })
}));
// flash �м�ۣ�������ʾ֪ͨ
app.use(flash());

// ��������ļ��ϴ����м��
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),// �ϴ��ļ�Ŀ¼
  keepExtensions: true// ������׺
}));

// ����ģ��ȫ�ֳ���
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
};

// ���ģ��������������
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  next();
});

/**
���Կ��������ǽ������������־��ӡ���ն˲�д���� logs/success.log���������������־��ӡ���ն˲�д���� logs/error.log����Ҫע����ǣ���¼����������־���м��Ҫ�ŵ� routes(app) ֮ǰ����¼����������־���м��Ҫ�ŵ� routes(app) ֮��
**/

// �����������־
/**
app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
**/
// ·��
routes(app);
// �����������־
/**
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));
**/
// error page
app.use(function (err, req, res, next) {
  res.render('error', {
    error: err
  });
});

// �����˿ڣ���������
/**app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`);
});
**/

if (module.parent) {
  module.exports = app;
} else {
  // �����˿ڣ���������
  app.listen(config.port, function () {
 console.log("--------------"+process.env.NODE_ENV);
    console.log(`${pkg.name} listening on port ${config.port}`);
  });
}