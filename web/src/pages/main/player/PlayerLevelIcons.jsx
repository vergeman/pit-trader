import { memo } from "react";

const PlayerLevelItems = (props) => {
  const level = props.level;
  console.log("[PlayerLevelItems]", level);

  if (!level) return null;

  const icons = [];
  for (let i = 1; i <= level; i++) {
    const icon = props.player.getConfig(i).reward.icon;
    const icon_title = props.player.getConfig(i).reward.icon_title;
    const title = `Level ${i + 1}: ${icon_title}`;

    icons.push(
      <span
        key={`level-icon-${i + 1}`}
        className="px-1"
        title={title}
        role="button"
      >
        {icon}
      </span>
    );
  }

  console.log("[PlayerLevelIcons] render");

  return <div className="d-none d-xl-block fs-4">{icons}</div>;
};

export default memo(PlayerLevelItems);
