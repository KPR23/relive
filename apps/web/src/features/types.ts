import { RouterOutputs } from '../trpc/client';

export type Photo = RouterOutputs['photo']['listPhotos'][number];
