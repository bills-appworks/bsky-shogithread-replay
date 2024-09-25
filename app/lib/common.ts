import { KifuStore } from 'kifu-for-js';
import { ParsedInfoSingleMove, ParsedInfo } from '@/app/lib/bsky';

// UIコンポーネント間でクエリ結果共有のための状態
export type ReplayState = {
  kifuStore;
  url;
};

export function convertShogithreadToKI2(parsedInfo: ParsedInfo): string {
  return parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    return parsedInfoSingleMove.text?.replace(/.+([△▲][^ ]+) .+$/, "$1");
  }).join(" ");
}
