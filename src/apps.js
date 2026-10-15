import {fluentIcons} from './fluent-icons.js';
// Existing services remain independently deployed. Only the desktop is new.
export const services = [
  ['insight','Insight Hub','insight-hub2-0-x45d','numbers-make-spreadsheets','Intelligence'],
  ['network','Network Map','network-map-v846','find-my','Network'],
  ['atlas','Service Map','service-map-atlas-client','find-my','Network'],
  ['docbox','DocBOX','docbox3-usme','preview','Documents'],
  ['search','Ultra Search','ultra-search-browser-hsbn','safari','Research'],
  ['prices','Price Search','price-search-tool-7unq','stocks','Pricing'],
  ['supplies','Clinic Supplies','lab-supplies-order-clinic','reminders','Operations'],
  ['agreements','Pricing Agreements','pricing-agreement-generator-8c1w','pages-create-documents','Documents'],
  ['international','International Search','international-search-015g','safari','Research'],
  ['forms','Occu-Med Forms','occu-med-forms','pages-create-documents','Documents'],
  ['signatures','Document Signing','docusign-replacement-undc','textedit','Documents'],
  ['vault','Source Vault','source-vault-fny8','books','Research'],
  ['review','Exam Review','exam-review-report-0qz9','reminders','Operations'],
  ['conversion','Price Conversion','occu-med-price-conversion-7r9e','calculator','Pricing'],
  ['hiring','Hiring Trends','hiring-trend-dashboard-mt68','grapher','Intelligence'],
  ['provider','Provider Intelligence','pi-app-rcu8','contacts','Intelligence'],
  ['geocode','Geocode Tool','geocode-tool-network-1-6233','find-my','Network'],
  ['supplies-admin','Supplies Admin','lab-supplies-order-fv5r','system-settings','Administration'],
  ['atlas-admin','Service Map Admin','service-map-atlas-c87g','system-settings','Administration'],
].map(([id,name,host,art,category])=>({id,name,url:`https://${host}.onrender.com`,art,category}));
export const pinnedIds=['insight','network','atlas','docbox','search','prices','supplies','agreements'];
export const iconUrl=(art)=>fluentIcons[art]||`https://ik.imagekit.io/16u211libb/smoothui/app-icons/${art}.png?tr=w-192`;
