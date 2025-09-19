// fetch_epg.js — sample 7-day XMLTV generator
const fs = require('fs/promises');
const { create } = require('xmlbuilder2');
const { DateTime } = require('luxon');

const CHANNELS = require('./channels.json');
const OUT_PATH = './public/guide.xml';

function toXmltv(dt) {
  // dt is a luxon DateTime in UTC
  return dt.toFormat('yyyyLLddHHmmss') + ' +0000';
}

(async () => {
  try {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('tv', { 'generator-info-name': 'github-epg-sample' });

    // Write channel elements
    for (const ch of CHANNELS) {
      const chEle = doc.ele('channel', { id: ch.id });
      chEle.ele('display-name').txt(ch.displayName).up();
      if (ch.icon) chEle.ele('icon', { src: ch.icon }).up();
      chEle.up();
    }

    // Generate 7 days of sample programs (3 per day)
    const startOfTodayUtc = DateTime.utc().startOf('day');
    for (const ch of CHANNELS) {
      for (let d = 0; d < 7; d++) {
        const day = startOfTodayUtc.plus({ days: d });
        const programs = [
          { title: 'Morning Show', start: day.plus({ hours: 8 }), stop: day.plus({ hours: 10 }), desc: 'Daily morning show.' },
          { title: 'Midday Magazine', start: day.plus({ hours: 12 }), stop: day.plus({ hours: 14 }), desc: 'Midday features and talk.' },
          { title: 'Evening News', start: day.plus({ hours: 20 }), stop: day.plus({ hours: 22 }), desc: 'Local and national news.' }
        ];
        for (const p of programs) {
          const start = toXmltv(p.start);
          const stop  = toXmltv(p.stop);
          const pg = doc.ele('programme', { start, stop, channel: ch.id });
          pg.ele('title', { lang: 'en' }).txt(p.title).up();
          pg.ele('desc', { lang: 'en' }).txt(p.desc).up();
          pg.up();
        }
      }
    }

    const xml = doc.end({ prettyPrint: true });
    await fs.mkdir('public', { recursive: true });
    await fs.writeFile(OUT_PATH, xml, 'utf8');
    console.log(`Wrote ${OUT_PATH}`);
  } catch (err) {
    console.error('Error generating XMLTV:', err);
    process.exit(1);
  }
})();
