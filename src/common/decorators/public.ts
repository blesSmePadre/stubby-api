import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC } from '../constants';

export const Public = (access = true) => SetMetadata(IS_PUBLIC, access);
