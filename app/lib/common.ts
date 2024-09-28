import { KifuStore } from 'kifu-for-js';
import { ParsedInfoSingleMove, ParsedInfo } from '@/app/lib/bsky';

// UIコンポーネント間でクエリ結果共有のための状態
export type ReplayState = {
  kifuStore;
  url: string;
};

export function convertShogithreadToKI2(parsedInfo: ParsedInfo): string {
  const startText = '*対局開始';
  const movesText = parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    // 指し手ポストのテキストからKI2部分抽出
    const textKI2 = parsedInfoSingleMove.text?.replace(/.+([△▲][^ ]+) .+$/, "$1");
    // KI2部分＋コメント行（将棋threadポストのテキスト）
    return `${textKI2}\n*${parsedInfoSingleMove.text}`;
  }).join("\n");
  let movesKI2 = `${startText}\n${movesText}`;
  if (parsedInfo.resignAt !== null) {
    movesKI2 = `${movesKI2}\nまで${parsedInfo.text}`
  }
  return movesKI2;
}
