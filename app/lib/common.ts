// Next.js
import { Anybody, Noto_Sans_JP } from 'next/font/google';
// 定義参照
import { KifuStore } from 'kifu-for-js';
import { ParsedInfoSingleMove, ParsedInfo, buildPostURL } from '@/app/lib/bsky';
import { queryShogithread } from '@/app/lib/bsky';
import { DialogBoxState } from '@/app/ui/dialog-box';

export const Version: string = "1.0.0"

export const notoSansJP = Noto_Sans_JP({
  weight: '400',
  subsets: ['latin'],
});

// UIコンポーネント間でクエリ結果共有のための状態管理の型
export type KifuStoreState = {
  kifuStore: any;
};

export type KifuManageState = {
  isBuilt: boolean;
  step: number;
};

//export type ResultDisplayState = {
//  replayURL: string;
//  historyView: string;
//  dataUSI: string;
//  dataKI2: string;
//  dataKIF: string;
//};

export type SpecifiedOption = {
  isOutputPlayer: boolean;
  isOutputCommentKI2: boolean;
  isOutputCommentKIF: boolean;
};

// 状態初期値
const initialMoves: ParsedInfoSingleMove = {text: null, at: null, did: null, handle: null, displayName: null, alt: null, uri: null, };
export const initialParsedInfo: ParsedInfo = {moves:[initialMoves], text: "", movesAlt: "", resignAt: null, resignURI: null, };
export const initialKifuStore = { kifuStore: new KifuStore({ kifu: "", }) };
export const initialKifuManageState: KifuManageState = { isBuilt: false, step: 0, };
export const initialURLState: string = '';
//export const initialResultDisplayState: ResultDisplayState = { dataKIF: "", };
export const initialPostURLState: string = "";
export const initialSpecifiedOption: SpecifiedOption = { isOutputPlayer: true, isOutputCommentKI2: true, isOutputCommentKIF: true, };
export const initialDialogBoxState: DialogBoxState = { isOpen: false, textTitle: '確認してください', textBody: '', };

// KIF形式消費時間最大単位
enum KifDatetimeMaxUnit {
  Second,
  Minute,
  Hour,
  Day,
  Month,
  Year,
};

export function getURLoriginPath() {
  const href = new URL(window.location.href);
  return href.origin + href.pathname;
}

export function setTextAreaById(id: string, text: string) {
  const element = document.getElementById(id);
  if (element && element instanceof HTMLTextAreaElement) {
    element.value = text;
  }
}

export async function buildShogithreadInfo(
  url: string | null,
  profile: string | null,
  recordId: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  step : string | null,
//  setDialogBoxState: React.Dispatch<React.SetStateAction<DialogBoxState>>,
//  dialogBoxState: DialogBoxState,
): Promise<[ParsedInfo, any, string, string, string, string, string, string]> {
//  try{
    const [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF] = await queryShogithread(url, profile, recordId, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF);
    const kifuStore = new KifuStore({ kifu: kifuText });
//    const resultDisplayState: ResultDisplayState = {
//      replayURL: getURLoriginPath() + buildReplayURLParameters(url, profile, recordId, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step),
//      historyView: historyViewText,
//      dataUSI: dataUSI,
//      dataKI2: dataKI2,
//      dataKIF: dataKIF,
//    };
    const replayURL = getURLoriginPath() + buildReplayURLParameters(url, profile, recordId, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF, step);
    const postURL = buildPostURL(parsedInfo, step ? parseInt(step) : null);
    return [parsedInfo, kifuStore, replayURL, historyViewText, postURL, dataUSI, dataKI2, dataKIF];
//  } catch(e: unknown) {
//    if (e instanceof Error) {
////      setDialogBoxState({ isOpen: true, textTitle: dialogBoxState.textTitle, textBody: e.message});
//      console.log(e);
//    }
//  }
};

export function buildReplayURLParameters(
  url: string | null,
  profile: string | null,
  recordId: string | null,
  isOutputPlayer: boolean,
  isOutputCommentKI2: boolean,
  isOutputCommentKIF: boolean,
  step: string | null,
): string {
  let parameters = {
     "url": url ? url : '',
     "player": isOutputPlayer.toString(),
     "KI2-comment": isOutputCommentKI2.toString(),
     "KIF-comment": isOutputCommentKIF.toString(),
  };
  if (profile) {
    parameters = { ...parameters, ...{profile: profile}};
  }
  if (recordId) {
    parameters = { ...parameters, ...{"record-id": recordId}};
  }
  if (step) {
    parameters = { ...parameters, ...{step: step}};
  }
  const URLParameters = '?' + new URLSearchParams(parameters).toString();
  return URLParameters;
}

export function convertShogithreadToKI2(parsedInfo: ParsedInfo, isOutputPlayer: boolean = true, isOutputComment: boolean = true): string {
  const startText = '*対局開始';
  const movesText = parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    // 指し手ポストのテキストからKI2部分抽出
    let text = extractMoveKI2(parsedInfoSingleMove.text);
    // コメント行（指し手メタ情報）
    if (isOutputComment) {
      const datetime = convertISO8601ToKifDatetime(parsedInfoSingleMove.at);
      //text += `\n*${parsedInfoSingleMove.text}`; // 指し手ポストテキスト
      text += `\n*${datetime}`;
      if (isOutputPlayer) {
        text += `\n*${parsedInfoSingleMove.displayName}`;
      }
    }
    return text;
  }).join("\n");
  let movesKI2 = `${movesText}`;
  if (isOutputComment) {
    movesKI2 = `${startText}\n${movesKI2}`
  }
  if (parsedInfo.resignAt !== null) {
    movesKI2 = `${movesKI2}\nまで${parsedInfo.text}`
  }
  return movesKI2;
}

export function convertShogithreadToHistoryView(parsedInfo: ParsedInfo, isOutputPlayer: boolean = true): string {
  let movesText = parsedInfo.moves.map((parsedInfoSingleMove: ParsedInfoSingleMove) => {
    const datetime = convertISO8601ToKifDatetime(parsedInfoSingleMove.at);
    const moveStep = extractMoveStep(parsedInfoSingleMove.text).padEnd(3, '　');
    const moveText = extractMoveKI2(parsedInfoSingleMove.text);
    let text = `${datetime}    ${moveStep}`;
    if (isOutputPlayer) {
      text += `${moveText.padEnd(6, '　')}${parsedInfoSingleMove.displayName}`;
    } else {
      text += `${moveText}`
    }
    return text;
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

export function convertShogithreadToKIF(parsedInfo: ParsedInfo, isOutputTurn: boolean = false, isOutputPlayer: boolean = true, isOutputComment: boolean = true, isOutputTime: boolean = true): string {
  const startMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(0);
  const endMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(-1);

//  console.log(`startMove: ${JSON.stringify(startMove, null, 2)}`);
//  console.log(`endMove: ${JSON.stringify(endMove, null, 2)}`);

  if (startMove === undefined || endMove === undefined) {
    return '';
  }

  const startMoveAt: string | null = startMove.at;
  const endMoveAt: string | null = endMove.at;

  if (startMoveAt === null || endMoveAt === null) {
    return '';
  }

  const startDatetime: string | null = convertISO8601ToKifDatetime(startMoveAt);
  const endDatetime: string | null = convertISO8601ToKifDatetime(endMoveAt);

  const kifHeader: string = `\
開始日時：${startDatetime}
終了日時：${endDatetime}
手合割：平手
先手：（先手）
後手：（後手）
手数----指手---------消費時間--
`;
  const kifMoves: string[] = parsedInfo.moves.map((parsedInfoMove: ParsedInfoSingleMove, index: number) => {
    //// 手数
    //// 指手
    let moveText: string | null = '';
    if (parsedInfoMove.did == null) {
      // 投了・中断
      moveText = parsedInfoMove.text;
    } else {
      // 手番・移動先座標・駒・装飾子
      let moveTextTo: string | undefined = parsedInfoMove.text?.replace(/[0-9]+手目: ([▲△][^ ]+) (\([^)]+\))/, "$1");
      // 手番（▲△）出力抑止
      if (!isOutputTurn) {
        moveTextTo = moveTextTo?.substring(1);
      }
      // 移動元座標
      let moveTextFrom: string | undefined = parsedInfoMove.text?.replace(/[0-9]+手目: ([▲△][^ ]+) (\(..)/, "$2");
      if (moveTextTo !== undefined && moveTextFrom !== undefined) {
        if (moveTextFrom.length > 2) {
          // 移動元座標の縦座標
          const moveTextFromOrdinate: string = moveTextFrom.substring(2, 3);
          switch (moveTextFromOrdinate) {
            case 'a':
              moveTextFrom = moveTextFrom.substring(0, 2) + '1)';
              break;
            case 'b':
              moveTextFrom = moveTextFrom.substring(0, 2) + '2)';
              break;
            case 'c':
              moveTextFrom = moveTextFrom.substring(0, 2) + '3)';
              break;
            case 'd':
              moveTextFrom = moveTextFrom.substring(0, 2) + '4)';
              break;
            case 'e':
              moveTextFrom = moveTextFrom.substring(0, 2) + '5)';
              break;
            case 'f':
              moveTextFrom = moveTextFrom.substring(0, 2) + '6)';
              break;
            case 'g':
              moveTextFrom = moveTextFrom.substring(0, 2) + '7)';
              break;
            case 'h':
              moveTextFrom = moveTextFrom.substring(0, 2) + '8)';
              break;
            case 'i':
              moveTextFrom = moveTextFrom.substring(0, 2) + '9)';
              break;
            case '*':
              moveTextTo += '打';
              moveTextFrom = '';
              break;
            default:
              throw new Error(`Unknown ordinate character: ${moveTextFromOrdinate}`);
          }
        }
        moveText = moveTextTo + moveTextFrom;
      }
    }

    //// 消費時間
    // 1手の消費時間
    let consumptionTime: string = '0:00';
    // 累積の消費時間
    let cumulativeConsumptionTime: string = '00:00:00';
    if (isOutputTime) {
      if (index > 0) {
        const prevMove: ParsedInfoSingleMove | undefined = parsedInfo.moves.at(index - 1);
        if (prevMove !== undefined) {
          const prevMoveAt: string | null = prevMove.at;
          const thisMoveAt: string | null = parsedInfoMove.at;
          if (prevMoveAt != null && thisMoveAt != null) {
            consumptionTime = getDiffISO8601ToKifDatetime(prevMoveAt, thisMoveAt, KifDatetimeMaxUnit.Minute);
            cumulativeConsumptionTime = getDiffISO8601ToKifDatetime(startDatetime, thisMoveAt, KifDatetimeMaxUnit.Hour);
          }
        }
      }
    }
    let text = `${index + 1} ${moveText} ( ${consumptionTime}/${cumulativeConsumptionTime})`
    // コメント行（指し手メタ情報）
    if (isOutputComment) {
      const datetime = convertISO8601ToKifDatetime(parsedInfoMove.at);
      //text += `\n*${parsedInfoMove.text}`; // 指し手ポストテキスト
      text += `\n*${datetime}`;
      if (isOutputPlayer) {
        text += `\n*${parsedInfoMove.displayName}`;
      }
    }
    return text;
  });
  return kifHeader + kifMoves.join("\n");
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

function getDiffISO8601ToKifDatetime(startDatetime: string, endDatetime: string, maxDatetimeUnit: KifDatetimeMaxUnit): string {
  const startDate: Date = new Date(startDatetime);
  const endDate: Date = new Date(endDatetime);;
  const diffMilliSecond: number = endDate.getTime() - startDate.getTime();

  let kifDatetime: string | null = null;
  let diffSecond: number = Math.floor(diffMilliSecond / 1000);
  if (maxDatetimeUnit > KifDatetimeMaxUnit.Second) {
    let diffMinute = Math.floor(diffSecond / 60);
    diffSecond -= (diffMinute * 60);
    if (maxDatetimeUnit > KifDatetimeMaxUnit.Minute) {
      const diffHour = Math.floor(diffMinute / 60); // 上位単位処理を拡張するなら上位処理で補正するのでconstはletに
      diffMinute -= (diffHour * 60);
      if (maxDatetimeUnit > KifDatetimeMaxUnit.Hour) {
          // 日単位以降は未実装（棋譜で未対応）
          /*
          let diffDay = Math.floor(diffHour / 24);
          diffHour -= (diffDay * 24);
          if (maxDatetimeUnit > KifDatetimeMaxUnit.Day) {
            let diffMonth = Max.floor(diffHour / ??? ); // 1ヶ月の日数要調整
            diff day -= (diffDay * ???);
            // 以降省略
          } else { // 指定最大単位：日
            // ???
            kifDatetime = `...`
          }
          */
          throw new Error(`${maxDatetimeUnit} is not implemented.`);
      } else { // 指定最大単位：時
        // 時(最小2桁):分(2桁):秒(2桁)
        kifDatetime = `${diffHour.toString().padStart(2, '0')}:${diffMinute.toString().padStart(2, '0')}:${diffSecond.toString().padStart(2, '0')}`
      }
    } else { // 指定最大単位：分
      // 分:秒(2桁)
      kifDatetime = `${diffMinute.toString()}:${diffSecond.toString().padStart(2, '0')}`
    }
  } else { // 指定最大単位：秒
    // 秒
    kifDatetime = diffSecond.toString();
  }
  return kifDatetime;
}
