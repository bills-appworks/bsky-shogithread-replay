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
    const kifuText = await queryShogithread(formData);
    setReplayState({kifuStore: new KifuStore({ kifu: kifuText}), url: replayState.url});
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            className="w-full"
            id="url"
            name="url"
            type="url"
            placeholder={ShogithreadUrlPlaceholder}
            key={replayState.url}
            defaultValue={replayState.url}
            onChange={(event) => {setReplayState({ kifuStore: replayState.kifuStore, url: event.target.value})}}
          />
        </div>
        <div>
          <button className="bg-green-500 shadow-2xl" type="submit">棋譜リプレイ</button>
          <button className="ml-2 bg-green-500 shadow-2xl"
            onClick={(event) => {
              event.preventDefault();
              setReplayState({kifuStore: new KifuStore({ kifu: ""}), url: ""});
            }}
          >リセット</button>
        </div>
      </form>
    </div>
  );
}

export default Input;