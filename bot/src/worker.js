// ИЖТ — Telegram webhook. Никакие ответы анкеты не передаются серверу бота.
const APP_DEFAULT='https://alyonasemenov.github.io/women-books-app/';
const CHANNEL_DEFAULT='https://t.me/alyonasemyonova';

export function commandOf(text) {
  if (typeof text!=='string') return null;
  const match=/^\/([a-z_]+)(?:@[a-zA-Z0-9_]+)?(?:\s|$)/i.exec(text.trim());
  return match ? match[1].toLowerCase() : null;
}

export function responseFor(command, env) {
  const app={text:'Открыть ИЖТ',web_app:{url:env.APP_URL||APP_DEFAULT}};
  const channel={text:'Книги и исследования',url:env.CHANNEL_URL||CHANNEL_DEFAULT};
  switch(command){
    case 'start':return {text:'Здравствуйте!\n\nДобро пожаловать в Индекс женского тела — ИЖТ.\n\nЯ Алёна Семёнова. Я создала этот исследовательский калькулятор, чтобы помочь женщинам внимательнее относиться к собственному телу, учитывать его особенности и замечать изменения, заслуживающие внимания.\n\nВ приложении Вас ждут анкета, персональные объяснения результатов и библиотека научно-популярных статей.\n\nБудьте на стороне своего тела.\n\nИЖТ не ставит диагнозов и не заменяет консультацию врача.',reply_markup:{inline_keyboard:[[app],[channel]]}};
    case 'app':return {text:'Нажмите кнопку ниже, чтобы открыть Индекс женского тела.',reply_markup:{inline_keyboard:[[app]]}};
    case 'about':return {text:'ИЖТ — авторский исследовательский проект Алёны Семёновой.\n\nКалькулятор помогает рассматривать измерения вместе с особенностями женского тела, этапом жизни, движением и самочувствием. Результат — не процент здоровья и не диагноз.\n\nЧитайте материалы об исследованиях внутри приложения или переходите в авторский Telegram-канал.',reply_markup:{inline_keyboard:[[app],[channel]]}};
    case 'help':return {text:'Как пользоваться ИЖТ:\n\n1. Нажмите «Открыть ИЖТ» или синюю кнопку приложения внизу чата.\n2. Ответьте на вопросы анкеты. Можно возвращаться к предыдущим шагам.\n3. Прочитайте персональные объяснения и статьи.\n4. По желанию сохраните результат или карточку для публикации.\n\nКоманды: /start, /app, /about, /help.\n\nИЖТ не заменяет врача.',reply_markup:{inline_keyboard:[[app]]}};
    default:return null;
  }
}

export default {
  async fetch(request,env){
    const {pathname}=new URL(request.url);
    if(request.method==='GET' && pathname==='/health')return Response.json({ok:true,service:'izht-telegram-bot'});
    if(request.method!=='POST'||pathname!=='/telegram/webhook')return new Response('Not found',{status:404});
    if(!env.BOT_TOKEN||!env.WEBHOOK_SECRET)return new Response('Service not configured',{status:503});
    if(request.headers.get('X-Telegram-Bot-Api-Secret-Token')!==env.WEBHOOK_SECRET)return new Response('Unauthorized',{status:401});
    let update;
    try {update=await request.json()}catch{return new Response('Invalid JSON',{status:400})}
    const msg=update?.message;
    if(!msg?.chat?.id||msg.chat.type!=='private')return new Response('OK');
    const output=responseFor(commandOf(msg.text),env);
    if(!output)return new Response('OK');
    const sent=await fetch('https://api.telegram.org/bot'+env.BOT_TOKEN+'/sendMessage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chat_id:msg.chat.id,...output})});
    return sent.ok?new Response('OK'):new Response('Delivery failed',{status:502});
  }
};