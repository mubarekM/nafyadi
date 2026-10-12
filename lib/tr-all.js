import { HOME } from "./tr-home";
import { EXTRA } from "./tr-extra";
import { STUDENT } from "./tr-student";
import { LEARN } from "./tr-learn";
import { PAY } from "./tr-pay";
import { UI } from "./tr-ui";
import { PAY2 } from "./tr-pay2";
import { MORE } from "./tr-more";
import { LEGAL_T } from "./tr-legal";

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
  };
}
