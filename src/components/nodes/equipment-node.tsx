import { Handle, Position, NodeResizer, NodeProps } from 'reactflow'
import oilJackSvg from '../../assets/oiljack_2.svg'
import pumpSvg from '../../assets/pump2.svg'
import tankSvg from '../../assets/tank_sublike.svg'

interface EquipmentNodeData {
  label: string
  type: string
}

const equipmentIcons: { [key: string]: string } = {
  oilJack: oilJackSvg,
  pump: pumpSvg,
  tank: tankSvg
}

const handleStyle = {
  width: 10,
  height: 10,
  background: '#fff',
  border: '2px solid #778899',
  top: '-5px',
  left: '50%',
  transform: 'translate(-50%, 0)'
}

export function EquipmentNode({ data, selected }: NodeProps<EquipmentNodeData>) {
  const icon = equipmentIcons[data.type]

  return (
    <div className="relative">
      <NodeResizer 
        isVisible={selected} 
        minWidth={30} 
        minHeight={30}
        keepAspectRatio
      />
      <Handle 
        type="source" 
        position={Position.Top} 
        style={handleStyle}
        id="t"
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        style={{
          ...handleStyle,
          top: '50%',
          left: '-5px',
          transform: 'translate(0, -50%)'
        }}
        id="l"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{
          ...handleStyle,
          top: '50%',
          left: 'auto',
          right: '-5px',
          transform: 'translate(0, -50%)'
        }}
        id="r"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{
          ...handleStyle,
          top: 'auto',
          bottom: '-5px'
        }}
        id="b"
      />
      <img src={icon} alt={data.label} className="w-full h-full object-contain" />
    </div>
  )
} 