import {memo} from "react";

const PlayerLevelItems = (props) => {

  const level = props.level;
  // const reward = props.player.configs[level].reward;
  // const icon = reward.icon;

  if (!level) return null;

  const icons = [];
  for (let i = 1; i <= level; i++) {
    const icon = props.player.configs[i].reward.icon;
    const icon_title = props.player.configs[i].reward.icon_title;
    const title = `Level ${i}: ${icon_title}`;

    icons.push(
      <span className="px-1" title={title} role="button">
        {icon}
      </span>
    );
  }

  console.log("[PlayerLevelIcons] render");

  return (
    <div className="d-none d-xl-block fs-4">
      {icons}
    </div>
  );

};

export default  memo(PlayerLevelItems);
