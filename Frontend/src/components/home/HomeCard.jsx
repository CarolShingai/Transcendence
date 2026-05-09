import React, { useState } from 'react';
import singleTrans from '../../assets/logo/SINGLE_TRANS.png';
import rankedTrans from '../../assets/logo/RANKED_TRANS.png';
import HomeCarousel from './HomeCarousel';
import HomeFriendsCard from './HomeFriendsCard';
import HomeGameCard from './HomeGameCard';

const EMPTY_CARDS = [{ id: 'single' }, { id: 'ranked' }, { id: 'friends' }];

function HomeCard({
  matches = [],
  friends = [],
  invites = [],
  onPlayGame,
  onOpenProfile,
  onSendInvite,
  onAcceptInvite,
  onRejectInvite,
  onSearchUsers
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((previous) => (previous === 0 ? EMPTY_CARDS.length - 1 : previous - 1));
  };

  const goToNext = () => {
    setCurrentIndex((previous) => (previous === EMPTY_CARDS.length - 1 ? 0 : previous + 1));
  };

  const cards = [
    {
      id: 'single',
      content: (
        <HomeGameCard
          title="Single player"
          image={singleTrans}
          imageAlt="Single player"
          matches={matches}
          onPlayGame={onPlayGame}
          gameType="single"
        />
      ),
    },
    {
      id: 'ranked',
      content: (
        <HomeGameCard
          title="Ranked"
          image={rankedTrans}
          imageAlt="Ranked"
          matches={matches}
          onPlayGame={onPlayGame}
          gameType="ranked"
        />
      ),
    },
    {
      id: 'friends',
      content: (
        <HomeFriendsCard
          friends={friends}
          invites={invites}
          onOpenProfile={onOpenProfile}
          onSendInvite={onSendInvite}
          onAcceptInvite={onAcceptInvite}
          onRejectInvite={onRejectInvite}
          onSearchUsers={onSearchUsers}
        />
      ),
    },
  ];

  return (
    <section className="home-card home-carousel-card" aria-label="Home screen">
      <HomeCarousel
        cards={cards}
        currentIndex={currentIndex}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </section>
  );
}

export default HomeCard;
