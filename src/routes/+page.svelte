<script>
  import AudioPlayer from '$lib/components/AudioPlayer.svelte';

  let items = [
    {
      label: 'I want to go to Morrow',
      audio: 'https://tile.loc.gov/streaming-services/iiif/service:mbrsrs:mbrsjukebox:dlc_victor_12_01_b12_11:dlc_victor_12_01_b12_11/full/full/0/full/default.mp3',
      src: 'https://www.loc.gov/item/jukebox-1016/'
    },
    {
      label: 'Unidentified commercial recording of Russian choral music',
      audio: 'https://tile.loc.gov/storage-services/service/afc/afc1991023/afc1991023_afs23872/afc1991023_afs23872_02.mp3',
      src: 'https://www.loc.gov/item/afc1991023_afs23872/'
    },
    {
      label: 'Weekend festival, Holy Ghost Society Park, Lowell, Massachusetts, part 2',
      audio: 'https://tile.loc.gov/storage-services/service/afc/afc1987042/afc1987042_tr_r025/afc1987042_tr_r025_01.mp3',
      src: 'https://www.loc.gov/item/afc1987042_tr_r025/'
    },
    {
      label: 'Conversation between John Stone and Sidney Robertson Cowell about making sound recordings',
      audio: 'https://tile.loc.gov/storage-services/media/afc/afc1940001/afc1940001_a3358b2.mp3',
      src: 'https://www.loc.gov/item/2017702047/'
    },
    {
      label: 'The Green fields of Virginia',
      audio: 'https://tile.loc.gov/storage-services/media/afc/afc1940001/afc1940001_a4201a2.mp3',
      src: 'https://www.loc.gov/item/2017701436/'
    },
    {
      label: 'Passamaquoddy story of Glooscap and the animals, part 2',
      audio: 'https://tile.loc.gov/storage-services/service/afc/afc1972003/afc1972003_sr31/afc1972003_sr31_2031769_4_1.mp3',
      src: 'https://www.loc.gov/item/2015655580/'
    },
    {
      label: 'Field Hollers',
      audio: 'https://tile.loc.gov/storage-services/media/ingested/api/loc.afc.afcss39.2603b2.mp3',
      src: 'https://www.loc.gov/item/lomaxbib000058/'
    },
    {
      label: 'Comments regarding the testing of a needle on an acetate disc being recorded',
      audio: 'https://tile.loc.gov/storage-services/media/afc/afc1940001/afc1940001_a4199a3.mp3',
      src: 'https://www.loc.gov/item/2017701960/'
    },
    {
      label: 'Robert Bly reading his poems with comment in the Recording Laboratory, May 2, 1960',
      audio: 'https://tile.loc.gov/storage-services/service/gdc/gdcarpl/gdcarpl-1411239/1411239-3-1.mp3',
      src: 'https://www.loc.gov/item/94838478/'
    },
    {
      label: 'Fragments (including Favorita) from a Portuguese broadcast over KRE, Oakland',
      audio: 'https://tile.loc.gov/storage-services/media/afc/afc1940001/afc1940001_a3860a3.mp3',
      src: 'https://www.loc.gov/item/2017700912/'
    },
    {
      label: 'Decidme, montes y selvas, Part 1 of 2 (Tell Me, Mountains and Forests) [Audio]',
      audio: 'https://tile.loc.gov/storage-services/service/afc/afc1940002/afc1940002_3907a3.mp3',
      src: 'https://www.loc.gov/item/raelbib000007/'
    },
    {
      label: 'Music, East Harlem Music School, New York, New York',
      audio: 'https://tile.loc.gov/storage-services/service/afc/afc1993001/afc1993001_afs23397/afc1993001_afs23397_01.mp3',
      src: 'https://www.loc.gov/item/afc1993001_afs23397/'
    },
  ];
</script>

<div class="grid grid-cols-1 gap-4 p-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {#each items as item}
    <article class="item-card">
      <div class="item-meta">
        <a href={item.src} target="_blank" rel="noreferrer">{item.label}</a>
      </div>

      <AudioPlayer src={item.audio} label={item.label} />
    </article>
  {/each}
</div>

<style>
  .grid {
    min-height: 100vh;
  }

  .item-card {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
    padding: 1rem;
    border-radius: 1.25rem;
    background: rgba(255, 255, 255, 0.42);
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.05);
  }

  .item-meta {
    min-height: 3.5rem;
    display: flex;
    align-items: flex-start;
  }

  .item-meta a {
    color: #0f172a;
    text-decoration: none;
    font-weight: 600;
    line-height: 1.4;
  }

  .item-meta a:hover,
  .item-meta a:focus-visible {
    text-decoration: underline;
    outline: none;
  }
</style>