/**
 * @author bills-appworks
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

import { ParsedInfo, ParsedInfoSingleMove } from "./bsky";

// KIF形式消費時間最大単位
export enum KifDatetimeMaxUnit {
  Second,
  Minute,
  Hour,
  Day,
  Month,
  Year
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
    movesKI2 = `${startText}\n${movesKI2}`;
  }
  if (parsedInfo.resignAt !== null) {
    movesKI2 = `${movesKI2}\nまで${parsedInfo.text}`;
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
      text += `${moveText}`;
    }
    return text;
  }).join("\n");
  if (parsedInfo.resignAt !== null) {
    const datetime = convertISO8601ToKifDatetime(parsedInfo.resignAt);
    movesText = `${movesText}\n${datetime}    ${parsedInfo.text}`;
  }
  return movesText;
}

export function extractMoveKI2(shogithreadText: string | null): string {
  if (shogithreadText == null) {
    return '';
  }
  return shogithreadText?.replace(/.+([△▲][^ ]+) .+$/, "$1");
}

export function extractMoveStep(shogithreadText: string | null): string {
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
    let text = `${index + 1} ${moveText} ( ${consumptionTime}/${cumulativeConsumptionTime})`;
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

export function convertISO8601ToKifDatetime(iso8601Datetime: string | null): string {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  if (iso8601Datetime == null) {
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
  const kifDatetime: string = `${year}/${month}/${day}(${weekDay}) ${hour}:${minute}:${second}`;
  return kifDatetime;
}

export function getDiffISO8601ToKifDatetime(startDatetime: string, endDatetime: string, maxDatetimeUnit: KifDatetimeMaxUnit): string {
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
        kifDatetime = `${diffHour.toString().padStart(2, '0')}:${diffMinute.toString().padStart(2, '0')}:${diffSecond.toString().padStart(2, '0')}`;
      }
    } else { // 指定最大単位：分
      // 分:秒(2桁)
      kifDatetime = `${diffMinute.toString()}:${diffSecond.toString().padStart(2, '0')}`;
    }
  } else { // 指定最大単位：秒
    // 秒
    kifDatetime = diffSecond.toString();
  }
  return kifDatetime;
}
