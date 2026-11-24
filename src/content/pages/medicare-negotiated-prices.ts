import { definePage } from '../../lib/page-types';
import { mfp, mfp2028, mfpKeyYear, PD, partD, mfpFile, $en } from './_util';
import { DATA } from '../../lib/engine/index';

const DRUGS = Object.entries(DATA.mfp.drugs);
const nice = (s: string) => s.split(';').map((x) => x.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())).slice(0, 3).join(', ');
const byYear = (y: string) => DRUGS.filter(([, d]) => d.ipay === y);
// Prix 2028 publiés par CMS le 23/11/2026 : nouveaux médicaments (premier prix en 2028), Tradjenta renégocié compris.
const new2028 = () => DRUGS.filter(([, d]) => d.prices['2028'] && !d.prices['2027'] && !d.prices['2026']);
const gone = () => byYear('2026').filter(([, d]) => !d.prices['2027']).map(([k]) => k.split(';')[0].trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
const list = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs.join(''));

export default definePage({
  id: 'medicare-negotiated-prices', group: 'medicare', order: 42,
  mini: 'mfpLookup', miniHref: 'medicare-part-d-cap',
  related: ['glp-1-prices-2027', 'medicare-part-d-cap', 'ozempic-cost', 'eliquis-cost', 'januvia-cost', 'trulicity-cost'],
  sources: ['cmsNegotiation', 'cmsFactSheet2026', 'cmsFactSheet2027', 'cmsFactSheet2028', 'cmsRate2027', 'medicarePartDCosts'],
  en: {
    slug: 'medicare-negotiated-prices', nav: 'Medicare negotiated prices', card: 'All negotiated Medicare drug prices for 2026 and 2027, and the 2028 prices',
    title: 'Medicare Negotiated Drug Prices 2026 and 2027: Full List',
    description: `Medicare negotiated drug prices for 2026 and 2027 from the CMS file: Eliquis, Jardiance, Januvia, Ozempic at ${$en(mfp('ozempic', 2027))} and 21 more drugs, plus the 2028 list.`,
    h1: 'Medicare negotiated drug prices for 2026 and 2027',
    intro: (h) => `Ten drugs have had a Medicare negotiated price since January 1, 2026, and fifteen more get one on January 1, 2027, semaglutide at ${h.usd(mfp('ozempic', 2027))} for 30 days among them.`,
    resume: (h) => `The Medicare Drug Price Negotiation Program, created by the Inflation Reduction Act, lets CMS set a maximum fair price for some of the brand drugs on which Part D spends the most. CMS publishes the results in a file that lists, for each drug and each package, the negotiated price for a 30-day equivalent supply and the dates it applies; the version we read is dated ${h.date(mfpFile())}. The first ten prices took effect on January 1, 2026, including ${h.usd(mfp('eliquis', 2026))} for Eliquis, ${h.usd(mfp('jardiance', 2026))} for Jardiance and ${h.usd(mfp('januvia', 2026))} for Januvia, and most are adjusted for inflation in 2027. Fifteen more start on January 1, 2027, the largest of them semaglutide, which covers Ozempic, Rybelsus and Wegovy at ${h.usd(mfp('ozempic', 2027))}. A third round of fifteen drugs, Trulicity among them, ended with prices for thirteen that CMS published in November 2026 and that apply from January 1, 2028, Trulicity at ${h.usd(mfp2028('TRULICITY'))} for 30 days. The negotiated price is what your Part D plan pays and the base of your coinsurance; under the standard benefit a year of Ozempic falls to about ${h.usd(partD('ozempic', '1', 2027))}.`,
    body: (h) => `
<h2>The ten drugs of 2026</h2>
${h.table(['Drug', 'Active ingredient', '2026, 30 days', '2027, 30 days'], byYear('2026').map(([k, d]) => [nice(k), d.ingredient.toLowerCase(), d.prices['2026'] ? h.usd(d.prices['2026'], d.prices['2026'] % 1 ? 2 : 0) : '–', d.prices['2027'] ? h.usd(d.prices['2027'], 2) : 'none listed']), `CMS file of negotiated prices dated ${h.date(mfpFile())}.`, ['l', 'l', 'r', 'r'])}
<p>${gone().length} drugs show no 2027 price (${list(gone())}): their 2027 lines in the CMS file end before they begin. A drug leaves the program when it stops qualifying, typically when a generic or biosimilar is marketed; the plan then goes back to its own contracted price.</p>
<h2>The fifteen drugs of 2027</h2>
${h.table(['Drug', 'Active ingredient', '2027, 30 days'], byYear('2027').map(([k, d]) => [nice(k), d.ingredient.toLowerCase(), h.usd(d.prices['2027'])]), 'Prices effective January 1, 2027.', ['l', 'l', 'r'])}
<h2>The 2028 prices, published in November 2026</h2>
<p>CMS selected fifteen drugs for 2028, Part B drugs for the first time, and closed the negotiations on November 1, 2026. It published the result in November 2026: thirteen negotiated prices, which apply from January 1, 2028. Xeljanz and Xolair get none, because a generic or a biosimilar reached the market, and Botox is not treated as selected while a court case runs. Tradjenta, renegotiated, moves from ${h.usd(mfpKeyYear('TRADJENTA', '2027'))} for 30 days in 2027 to ${h.usd(mfpKeyYear('TRADJENTA', '2028'))} in 2028.</p>
${h.table(['Drug', 'Active ingredient', '2028, 30 days'], new2028().map(([k, d]) => [nice(k), d.ingredient.toLowerCase(), h.usd(d.prices['2028'], d.prices['2028'] % 1 ? 2 : 0)]), `New negotiated prices effective January 1, 2028, CMS file dated ${h.date(mfpFile())}. The file also lists the 2028 inflation-adjusted prices of the earlier drugs, semaglutide at ${h.usd(mfp2028('OZEMPIC; RYBELSUS; WEGOVY'), 2)}.`, ['l', 'l', 'r'])}
<h2>What a Medicare negotiated drug price does to your bill</h2>
<p>The price is not a copay. It is the amount the Part D plan pays for a 30-day supply, and the base on which your 25% coinsurance is calculated after the deductible. If your plan charges a flat copay instead, the negotiated price changes the plan’s costs more than yours. It also changes how fast you reach the yearly cap: at ${h.usd(mfp('ozempic', 2027))} a month, a year of Ozempic adds up to ${h.usd(12 * mfp('ozempic', 2027))}, and your share under the standard benefit is about ${h.usd(partD('ozempic', '1', 2027))}, well below the ${h.usd(PD(2027).oopCap)} cap. The negotiated price applies only to Medicare: it is not a cash price and pharmacies do not offer it to uninsured customers.</p>
<h2>How a price is negotiated</h2>
<p>CMS selects drugs with high Part D spending that have been on the market for years without generic or biosimilar competition, sends the manufacturer an initial offer, receives a counteroffer, holds negotiation meetings and publishes the agreed maximum fair price. The law sets a ceiling on that price as a share of the drug’s non-federal average manufacturer price, which is why cuts range from about half to nearly four-fifths of the 2023 list price for the first round. Participation is voluntary for manufacturers in principle, but leaving means leaving Medicare and Medicaid.</p>
<h2>Where the GLP-1s stand</h2>
<p>Semaglutide has a negotiated price from 2027. Dulaglutide, sold as Trulicity, gets one from January 1, 2028: ${h.usd(mfp2028('TRULICITY'))} for 30 days, against a 2025 Medicare gross cost of $965 according to CMS. Tirzepatide (Mounjaro and Zepbound) and orforglipron (Foundayo) are not on any list; their Medicare prices stay those of each plan.</p>`,
    faqs: (h) => [
      { q: 'What is the Medicare negotiated price for Ozempic?', a: `${h.usd(mfp('ozempic', 2027))} for a 30-day supply from January 1, 2027. CMS negotiated semaglutide as one drug, so the same price applies to Ozempic, Rybelsus and Wegovy for the uses Part D covers. Before 2027, plans pay their own contracted price. The price applies to every strength.` },
      { q: 'Can I get the Medicare negotiated price without Medicare?', a: 'No. The maximum fair price is what Part D plans and pharmacies settle for Medicare beneficiaries. Uninsured buyers rely on self-pay programs and TrumpRx, whose prices are sometimes lower, as with Farxiga, and sometimes higher. The negotiated price also does not apply to employer plans.' },
      { q: 'Why do some 2026 drugs have no 2027 negotiated price?', a: `In the CMS file, the 2027 lines for ${list(gone())} are dated to end before they start. A drug leaves the program when it no longer qualifies, for example after generic or biosimilar entry, and Part D plans then return to their own contracted prices.` },
      { q: 'Does the negotiated price lower my copay?', a: `If you pay coinsurance, yes: 25% of a lower price after the deductible. If your plan uses a flat copay, it may not change. Either way, the yearly share stays capped at ${h.usd(PD(2026).oopCap)} in 2026 and ${h.usd(PD(2027).oopCap)} in 2027. The calculator applies the standard coinsurance design.` },
      { q: 'Which GLP-1 drugs have a Medicare negotiated price?', a: `Only semaglutide so far: Ozempic, Wegovy and Rybelsus at ${h.usd(mfp('ozempic', 2027))} for 30 days from 2027. Trulicity follows on January 1, 2028 at ${h.usd(mfp2028('TRULICITY'))} for 30 days, a price CMS published in November 2026. Mounjaro, Zepbound and Foundayo are not on any list, so Part D plans pay their own price.` },
    ],
  },
});
