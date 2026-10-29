@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<span class="brand-mark">&#10003;</span> {!! $slot !!}
</a>
</td>
</tr>
