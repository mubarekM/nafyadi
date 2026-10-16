import { HOME } from "./tr-home";
import { EXTRA } from "./tr-extra";
import { STUDENT } from "./tr-student";
import { LEARN } from "./tr-learn";
import { PAY } from "./tr-pay";
import { UI } from "./tr-ui";
import { PAY2 } from "./tr-pay2";
import { MORE } from "./tr-more";
import { LEGAL_T } from "./tr-legal";
import { SYNC } from "./tr-sync";
import { DS } from "./tr-ds";
import { PAGES } from "./tr-pages";
import { FIN } from "./tr-final";
import { LAST } from "./tr-last";
import { SEC } from "./tr-sec";

export const ALL = {};
for (const k of ["en", "am", "om"]) {
  ALL[k] = {
    ...HOME[k],
    ...EXTRA[k],
    ...STUDENT[k],
    ...LEARN[k],
    ...PAY[k],
    ...UI[k],
    ...PAY2[k],
    ...MORE[k],
    ...LEGAL_T[k],
    ...SYNC[k],
    ...DS[k],
    ...PAGES[k],
    ...FIN[k],
    ...LAST[k],
    ...SEC[k],
  };
}
