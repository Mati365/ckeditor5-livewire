{{-- Importmap for ESM assets --}}
@php
    $esmAssets = array_filter($bundle->js, fn($js) => $js->type === \Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType::ESM);
    $importMap = [];
    foreach ($esmAssets as $asset) {
        $importMap[$asset->name] = $asset->url;
    }
@endphp

@if(!empty($importMap))
    <script type="importmap" @if($nonce) nonce="{{ $nonce }}" @endif>
    {
        "imports": {!! json_encode($importMap) !!}
    }
    </script>
@endif

{{-- Stylesheets --}}
@foreach($bundle->css as $cssUrl)
    <link rel="stylesheet" href="{{ $cssUrl }}" crossorigin="anonymous" @if($nonce) nonce="{{ $nonce }}" @endif>
@endforeach

{{-- UMD scripts --}}
@php
    $umdAssets = array_filter($bundle->js, fn($js) => $js->type === \Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType::UMD);
@endphp
@foreach($umdAssets as $asset)
    <script src="{{ $asset->url }}" @if($nonce) nonce="{{ $nonce }}" @endif></script>
@endforeach

{{-- Module preload for ESM assets --}}
@foreach($esmAssets as $asset)
    <link rel="modulepreload" href="{{ $asset->url }}" crossorigin="anonymous" @if($nonce) nonce="{{ $nonce }}" @endif>
@endforeach
