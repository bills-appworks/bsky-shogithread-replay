/**
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2024
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
 */

import { NextRequest, NextResponse } from 'next/server';
//import { queryShogithread } from '@/app/lib/bsky';

export async function GET(request: NextRequest) {
// 静的ページ出力ではAPI Routeがサポートされていないため無効化
/*
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  const atUri = searchParams.get('at-uri');
  const isOutputPlayer = searchParams.get('player') != 'false';
  const isOutputCommentKI2 = searchParams.get('KI2-comment') != 'false';
  const isOutputCommentKIF = searchParams.get('KIF-comment') != 'false';

  let response;
  try {
    const [parsedInfo, kifuText, historyViewText, dataUSI, dataKI2, dataKIF] = await queryShogithread(url, atUri, isOutputPlayer, isOutputCommentKI2, isOutputCommentKIF);
    response = {
      "SFEN": dataUSI,
      "KI2": dataKI2,
      "KIF": dataKIF,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      response = {
        "error": e.name,
        "message": e.message,
      };
    }
  }
  return NextResponse.json(response);
*/
  return NextResponse.json({"error": "Error", "message": "Not implemented"});
}
