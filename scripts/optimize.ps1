# Temporarily add Node.js to PATH to avoid 'node is not recognized' errors
$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "Installing @gltf-transform/cli globally (bypassing local install issues)..."
npm install -g @gltf-transform/cli

$models = @("basic_keyboard.glb", "office_chair.glb", "desk.glb", "gaming_pc.glb", "banana_plant_with_pot.glb", "model.glb", "room.glb")
foreach ($model in $models) {
    Write-Host "Optimizing $model..."
    $input = "public\$model"
    $output = "public\${model}-opt.glb"
    
    # Run optimization
    gltf-transform optimize $input $output --compress draco --texture-compress webp
    
    if (Test-Path $output) {
        # Check size difference
        $oldSize = (Get-Item $input).length
        $newSize = (Get-Item $output).length
        Write-Host "Original: $($oldSize / 1MB) MB, New: $($newSize / 1MB) MB"
        
        Remove-Item "public\$model.bak" -ErrorAction SilentlyContinue
        Rename-Item $input "$model.bak"
        Rename-Item "public\${model}-opt.glb" $model
        Write-Host "Successfully replaced $model"
    } else {
        Write-Host "Failed to optimize $model"
    }
}
Write-Host "Optimization completed."
