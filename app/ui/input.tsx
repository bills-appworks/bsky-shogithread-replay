'use client';

import { ShogithreadUrlPlaceholder, queryShogithread} from '@/app/lib/bsky';
import { ReplayState } from '@/app/lib/common';
import React from 'react';
import { KifuStore } from 'kifu-for-js';

const Input = ({ setReplayState, replayState }: { setReplayState: React.Dispatch<React.SetStateAction<ReplayState>>, replayState: ReplayState }) => {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // event.target型解決
    // https://zenn.dev/kage1020/scraps/beec58cd5a3df9
    const formData = new FormData(event.target as HTMLFormElement);
    const [kifuText, historyViewText] = await queryShogithread(formData);
    setReplayState({ kifuStore: new KifuStore({ kifu: kifuText}), url: replayState.url, historyView: historyViewText, });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-1">
        <div>
          <div className="flex justify-center"><span className="font-bold">将棋thread対局URLを入力</span> (対局スレッドの最終指し手ポスト)</div>
        </div>
        <div className="flex justify-center">
          <input
            className="w-full rounded border-2 border-black bg-[#FFFFDD] font-sans"
            id="url"
            name="url"
            type="url"
            placeholder={ShogithreadUrlPlaceholder}
            key={replayState.url}
            defaultValue={replayState.url}
          />
        </div>
        <div className="flex justify-center">
          <button className="bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
            shadow shadow-black font-bold p-1 rounded border-2 border-black" type="submit">
            棋譜リプレイ
          </button>
          <button className="ml-2 bg-[#FFE581] hover:bg-[#EFD571] active:bg-[#DFC561]
            shadow shadow-black p-1 rounded border border-black" type="reset"
            onClick={(event) => {
              setReplayState({ kifuStore: new KifuStore({ kifu: "" }), url: "", historyView: "", });
            }}
          >
            リセット
          </button>
        </div>
        </div>
      </form>
    </div>
  );
}

export default Input;