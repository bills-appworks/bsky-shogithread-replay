import { Noto_Sans_JP } from 'next/font/google';
import { KifuStore } from 'kifu-for-js';
import { ParsedInfoSingleMove, ParsedInfo } from '@/app/lib/bsky';

export const notoSansJP = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
});

// UIコンポーネント間でクエリ結果共有のための状態
export type ReplayState = {
  kifuStore;
  url: string;
  historyView: string;
};

export function convertShogithreadToKI2(parsedInfo: ParsedInfo): string {
  const startText = '*対局開始';
  const movesText = parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    // 指し手ポストのテキストからKI2部分抽出
    const textKI2 = extractMoveKI2(parsedInfoSingleMove.text);
    const datetime = convertISO8601ToKifDatetime(parsedInfoSingleMove.at);
    // KI2部分＋コメント行（指し手メタ情報）
    return `${textKI2}\n*${parsedInfoSingleMove.text}\n*${parsedInfoSingleMove.displayName}\n*${datetime}`;
  }).join("\n");
  let movesKI2 = `${startText}\n${movesText}`;
  if (parsedInfo.resignAt !== null) {
    movesKI2 = `${movesKI2}\nまで${parsedInfo.text}`
  }
  return movesKI2;
}
export function convertShogithreadToHistoryView(parsedInfo: ParsedInfo): string {
  let movesText = parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    const datetime = convertISO8601ToKifDatetime(parsedInfoSingleMove.at);
    const moveStep = extractMoveStep(parsedInfoSingleMove.text).padEnd(3, '　');
    const moveText = extractMoveKI2(parsedInfoSingleMove.text).padEnd(6, '　');
    return `${datetime}    ${moveStep}${moveText} ${parsedInfoSingleMove.displayName}`
  }).join("\n");
  if (parsedInfo.resignAt !== null) {
    const datetime = convertISO8601ToKifDatetime(parsedInfo.resignAt);
    movesText = `${movesText}\n${datetime}    ${parsedInfo.text}`
  }
  return movesText;
}

function extractMoveKI2(shogithreadText: string | null): string {
  if (shogithreadText == null) {
    return '';
  }
  return shogithreadText?.replace(/.+([△▲][^ ]+) .+$/, "$1");
}

function extractMoveStep(shogithreadText: string | null): string {
  if (shogithreadText == null) {
    return '';
  }
  return shogithreadText?.replace(/(.+)[△▲][^ ]+ .+$/, "$1");
}

function convertISO8601ToKifDatetime(iso8601Datetime: string | null): string {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  if (iso8601Datetime ==  null) {
    return '';
  }
  const date: Date = new Date(iso8601Datetime);
  // 日時各要素取得
  const year: string = date.getFullYear().toString();
  const month: string = (date.getMonth() + 1).toString().padStart(2, '0');
  const day: string = date.getDate().toString().padStart(2, '0');;
  const weekDay: string = weekDays[date.getDay()];
  const hour: string = date.getHours().toString().padStart(2, '0');
  const minute: string = date.getMinutes().toString().padStart(2, '0');
  const second: string = date.getSeconds().toString().padStart(2, '0');
  // YYYY/MM/DD(曜) hh:mm:ss
  const kifDatetime: string = `${year}/${month}/${day}(${weekDay}) ${hour}:${minute}:${second}`
  return kifDatetime;
}
