import { intro, pca, cluster } from '@/content/story';
export type ExpeditionChapter={title:string;status:string;pages:string[]};
function prose(value:unknown,key=''):string[]{
  if(/fig|image|link|code|table|dataset|caption|rows|head|sample|open|href|src|note/i.test(key))return [];
  if(typeof value==='string')return value.length>85 && !value.startsWith('http')?[value]:[];
  if(Array.isArray(value))return value.flatMap(v=>prose(v));
  if(value&&typeof value==='object')return Object.entries(value).flatMap(([k,v])=>prose(v,k));return [];
}
function pages(text:string[]){return text.flatMap(paragraph=>{const words=paragraph.split(/\s+/),parts:string[]=[];let page='';for(const w of words){if((page+' '+w).length>510){parts.push(page);page='';}page+=(page?' ':'')+w;}if(page)parts.push(page);return parts;});}
const planned=(title:string):ExpeditionChapter=>({title,status:'PLANNED · NO EVALUATED RESULTS',pages:[`${title} is a planned chapter. This snapshot contains no completed held-out evaluation for this model. The experiment must first specify its prediction target, establish source-disjoint training and test groups, and compare against a simple baseline.`, 'All windows and derivatives from one recording must remain in the same split. Fit transformations only on training data. Report performance on untouched recordings and investigate whether the model learns species information, recording conditions, or sampling artifacts.']});
export const EXPEDITION_CHAPTERS:ExpeditionChapter[]=[
 {title:'Introduction',status:'RESEARCH QUESTION',pages:pages(prose(intro.chapters))},
 {title:'Data Prep & EDA',status:'OBSERVED COLLECTION',pages:['The committed collection contains 275 focal bird recordings, 159 represented species and 1,179 audio windows. California contributes 100 recordings, Arizona 75 and Texas 100. These counts describe the acquired sample; they are not estimates of regional species richness.', 'The primary analysis uses 50 numeric acoustic features. Species, region, date and quality metadata are held out of unsupervised fitting and used for interpretation. Recording-level aggregation prevents treating correlated windows as independent recordings.', 'There are 103 species represented by one recording. Repeat recordings exist for 56 species, totaling 172 recordings. This uneven replication limits species-level generalization and requires careful sampling design before supervised evaluation.']},
 {title:'Clustering',status:'EXPLORATORY RESULTS · REPRESENTATION MATTERS',pages:pages([...cluster.overview,...cluster.prep,...cluster.kmeans.text,...cluster.hier.text,...cluster.yj.text,...cluster.yj.after,...cluster.conclusions])},
 {title:'PCA',status:'EXPLORATORY RESULTS · BASELINE & SENSITIVITY',pages:pages(prose(pca))},
 planned('Naive Bayes'),planned('Decision Trees'),planned('Regression'),planned('AdaBoost'),planned('GradientBoosting'),planned('XGBoost'),
 {title:'Conclusions',status:'INTERPRETATION & NEXT EXPERIMENT',pages:pages([...pca.conclusions,...cluster.conclusions,'The publication extension is a controlled test of when acoustic proxies fail as noise, overlap, gain, bandwidth and analysis choices change. A synthetic benchmark needs source-disjoint splits, a precise richness target, and validation on independent annotated soundscapes.'])},
];
