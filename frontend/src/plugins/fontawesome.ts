import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas, faList } from '@fortawesome/free-solid-svg-icons';

// Import specific icons
import {
  faUser,
  faEnvelope,
  faLock,
  faCheck,
  faTimes,
  faSearch,
  faHome,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

import {
  faUser as faUserRegular,
  faEnvelope as faEnvelopeRegular,
} from "@fortawesome/free-regular-svg-icons";

import {
  faGithub,
  faTwitter,
  faFacebook,
} from "@fortawesome/free-brands-svg-icons";

// Add icons to the library
library.add(
  faUser,
  faEnvelope,
  faLock,
  faCheck,
  faTimes,
  faSearch,
  faHome,
  faCog,
  faUserRegular,
  faEnvelopeRegular,
  faGithub,
  faTwitter,
  faFacebook,
  faList,
  fas
);

export { FontAwesomeIcon };
